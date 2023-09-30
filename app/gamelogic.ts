
/*
* Every spot on the board is a bit set to 1
* 1  2   4
* 8  16  32
* 64 128 256
*
* Each player has their own 9-bit board. together 18 bits for each board.
* purple      | green
* 000 000 000 | 000 000 000
*
* There are 10 boards. 9 smaller and one big one.
* Players cannot play to the big board directly.
* The state knows what player can play so a play consists of a board (0 - 9) and a position in that board (0 - 9)
* the last play is stored as to know what next moves are allowed
* */


import { type Dispatch, useReducer } from 'react';

export type State = {
	boards: [number, number, number, number, number, number, number, number, number],
	super: number
	prevTurn: number,
	winner?: 'green' | 'purple' | 'draw',
};

type Play =  {
	board: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
	cell: number,
};

export type DispatchPlay = Dispatch<Play>;
export const tiles = [
	0, 1, 2,
	3, 4, 5,
	6, 7, 8
] as const;

const initialState: State = {
	boards: [
		0, 0, 0,
		0, 0, 0,
		0, 0, 0
	],
	super: 0,
	prevTurn: 0,
}

export function getOwner(board: number, cell: number) {
	if (board & cell) return 'green';
	if (board >> 9 & cell) return 'purple';
}

export function getPlayer(play: number) {
	if (play >> 9) return 'purple';
	if (play & 0x1ff) return 'green';
	return undefined;
}

export function setPlayer(play: number, player: 'green' | 'purple') {
	if (player === 'green') return play;
	return play << 9;
}

function normalise(board: number, player: 'green' | 'purple') {
	if (player === 'green') return board & 0x1ff;
	return board >> 9;
}

export function getBit(index: number) {
	return 1 << index;
}

function getIndex(bit: number) {
	switch (bit) {
		case 0b000_000_001: return 0;
		case 0b000_000_010: return 1;
		case 0b000_000_100: return 2;
		case 0b000_001_000: return 3;
		case 0b000_010_000: return 4;
		case 0b000_100_000: return 5;
		case 0b001_000_000: return 6;
		case 0b010_000_000: return 7;
		case 0b100_000_000: return 8;
	}
}
function grayscale(board: number) {
	return normalise(board, 'green') | normalise(board, 'purple');
}

function isDraw(board: number) {
	return grayscale(board) === 0b111_111_111;
}

export function getIsPlayable(game: State, boardIndex: number) {
	// first move
	if (game.prevTurn === 0) return true;

	// game is won
	if (game.winner !== undefined) return false;

	// board is owned
	if (getOwner(game.super, getBit(boardIndex))) return false;

	const targetBoard = grayscale(game.prevTurn);

	// if this is the next target
	if (targetBoard === getBit(boardIndex))
		return !isDraw(game.boards[boardIndex]);

	// if next target already has an owner
	if (getOwner(game.super, targetBoard)) return true;

	// if next target is drawn
	return isDraw(game.boards[getIndex(targetBoard)!]);
}

const winConditions = [
	//   rows          columns        diagonals
	0b000_000_111,  0b100_100_100,  0b100_010_001,
	0b000_111_000,  0b010_010_010,  0b001_010_100,
	0b111_000_000,  0b001_001_001,
];

const winConditionsAfterPlay = Object.fromEntries(tiles.map(tile => {
	const bit = getBit(tile);
	return [bit, winConditions.filter(condition => condition & bit)];
}));

function hasWon(board: number, player: 'green' | 'purple', play: number) {
	const playerBoard = normalise(board, player);
	return winConditionsAfterPlay[play].some(condition => (condition & playerBoard) === condition);
}


function gameReducer(state: State, play: Play): State {
	state.boards[play.board] |= play.cell;

	{
		const player = getPlayer(play.cell)!;

		if (hasWon(state.boards[play.board], player, normalise(play.cell, player))) {
			const board = getBit(play.board);
			state.super |= setPlayer(board, player);

			if (hasWon(state.super, player, board)) {
				return {
					...state,
					winner: player
				};
			}
			if (isDraw(state.super)) {
				return {
					...state,
					winner: 'draw'
				}
			}

		} else if (isDraw(state.boards[play.board]) && isDraw(state.super))  {
			return {
				...state,
				winner: 'draw'
			}
		}
	}

	return {
		...state,
		prevTurn: play.cell
	};
}

export function useGame() {
	return useReducer(gameReducer, initialState);
}