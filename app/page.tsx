'use client';

import {
	getBit,
	getIsPlayable,
	getOwner,
	getPlayer,
	type DispatchPlay,
	setPlayer,
	type State,
	tiles,
	useGame
} from '@/app/gamelogic';


export default function Home() {
	const [game, dispatch] = useGame();

    return (
        <main
	        className="
                grid grid-rows-[auto,1fr] min-h-screen place-items-center p-6
                data-[winner=green]:bg-emerald-500
                data-[winner=purple]:bg-purple-500
            "
	        data-winner={game.winner}
        >
	        {game.winner === undefined && (<h1 className="font-mono text-gray-400/40 mb-8 text-xl flex flex-col text-center">Super<span className="text-emerald-500 text-4xl">0<span className="text-purple-500">x</span>0</span></h1>)}
	        {game.winner && (<h1 className="font-mono text-gray-100/60 mb-8 text-xl flex flex-col text-center"><span className="text-4xl">{game.winner}</span>won</h1>)}
	        <Game game={game} dispatch={dispatch} />
	        {/* TODO: Rules */}
        </main>
    )
}



function Game({ game, dispatch }: { game: State, dispatch: DispatchPlay}) {
	const previousPlayer = getPlayer(game.prevTurn);
	const currentPlayer = previousPlayer === 'green' ? 'purple' : 'green';

	return (
		<div
			className="
				grid grid-cols-3 grid-rows-3 gap-2

				p-2 border-2 rounded-2xl
			    data-[player=green]:border-emerald-500
			    data-[player=purple]:border-purple-500

				bg-canvas
				group
		    "
			data-player={currentPlayer}
		>
			{tiles.map((board) =>
				<Board
					key={board}
					state={game.boards[board]}
					onSelect={(cell) => dispatch({ board: board, cell: setPlayer(cell, currentPlayer) })}
					owner={getOwner(game.super, getBit(board))}
					isPlayable={getIsPlayable(game, board)}
				/>
			)}
		</div>
	);
}

function Board({ state, onSelect, owner, isPlayable }: { state: number, onSelect: (cell: number) => void, owner?: 'green' | 'purple', isPlayable: boolean }) {
	return (
		<div
			className="
				grid grid-cols-3 grid-rows-3 gap-1

				p-2 border-2 rounded-lg border-gray-400/10
				data-[playable=true]:border-gray-400/40
				data-[owner=green]:border-emerald-500
				data-[owner=purple]:border-purple-500
			"
			data-owner={owner}
			data-playable={isPlayable}
		>
			{tiles.map(cell => {
				const bit = getBit(cell);
				const owner = getOwner(state, bit);
				if (owner === 'green') return <GreenCell key={cell} />
				if (owner === 'purple') return <PurpleCell key={cell} />;

				if (!isPlayable) return <UnavailableCell key={cell} />;

				return (
					<SelectableCell
						key={cell}
						onSelect={() => onSelect(bit)}
					/>
				);
			})}
		</div>
	);
}

function PurpleCell() {
	return <div className="w-6 h-6 bg-purple-500 rounded" />;
}

function GreenCell() {
	return <div className="w-6 h-6 bg-emerald-500 rounded" />;
}

function SelectableCell({ onSelect }: { onSelect: () => void }) {
	return <button
		onClick={onSelect}
		className="
			w-6 h-6 bg-gray-400/10 rounded
			group-data-[player=purple]:hover:bg-purple-500/50
			group-data-[player=green]:hover:bg-emerald-500/50
		"
	/>;
}

function UnavailableCell() {
	return <div className="w-6 h-6 bg-gray-400/0 rounded" />;
}