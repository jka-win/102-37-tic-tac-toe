
import React, { useState } from "react"

const Square = props => {
    const style = props.highlight ? {
        backgroundColor: "yellow"
    } : null;

    return (
        <button className="square" style={style} onClick={props.onClick}>
            {props.value}
        </button>
    );
};

class Board extends React.Component {
    renderSquare(x, y) {
        const highlight = this.props.highlight ?
            this.props.highlight.find(cell => x === cell.x && y === cell.y)
            : null;

        return <Square key={`${x},${y}`}
            value={this.props.squares[x][y]}
            highlight={highlight}
            onClick={() => this.props.onClick(x, y)} />;
    }

    render() {
        const rows = [];
        for (let y = 0; y < this.props.rows; y++) {
            const columns = [];
            for (let x = 0; x < this.props.columns; x++) {
                columns.push(
                    this.renderSquare(x, y)
                );
            }

            rows.push(
                <div key={y} className="board-row">{columns}</div>
            );
        }

        return <div>{rows}</div>;
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        const emptySquares = [];
        for (let x = 0; x < props.columns; x++) {
            emptySquares.push(new Array(props.columns).fill(null));
        }

        this.state = {
            history: [{
                squares: emptySquares,
                stepNumber: 0,
            }],
            stepNumber: 0,
            xIsNext: true,
            sort: "asc",
        };
    }

    currentMarker() {
        return this.state.xIsNext ? "X" : "O";
    }

    handleClick(x, y) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.map(column => [...column]);
        if (calculateWinner(squares, this.props.winCondition) || squares[x][y]) {
            return;
        }

        const marker = this.currentMarker();
        squares[x][y] = marker;
        this.setState({
            history: history.concat([{
                squares: squares,
                lastPlayed: { x, y, marker },
                stepNumber: history.length,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares, this.props.winCondition);
        const highlight = winner ? winner.cells : null;
        const draw = !current.squares.find(row => row.find(cell => !cell) !== undefined);

        const sorted = this.state.sort === "asc" ? history : [...history].reverse();
        const moves = sorted.map(step => {
            const style = step.stepNumber === this.state.stepNumber ? {
                fontWeight: "bold"
            } : null;
            const desc = step.stepNumber ? `Go to move #${step.stepNumber}` : "Go to game start";
            return (
                <div key={step.stepNumber}>
                    <button style={style} onClick={() => this.jumpTo(step.stepNumber)}>{desc}</button>
                    {step.lastPlayed ?
                        <em>{step.lastPlayed.marker} at row {step.lastPlayed.x}, column {step.lastPlayed.y}</em>
                        : null}
                </div>
            );
        });

        let status;
        if (winner) {
            status = `Winner: ${winner.marker}`;
        } else if (draw) {
            status = "It's a draw!";
        } else {
            status = `Next player: ${this.currentMarker()}`;
        }

        const handleSortChange = e => this.setState({
            sort: e.target.value,
        });

        return (
            <div className="game">
                <div className="game-board">
                    <Board rows={this.props.rows} columns={this.props.columns}
                        squares={current.squares} highlight={highlight}
                        onClick={(x, y) => this.handleClick(x, y)} />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div onChange={handleSortChange}>
                        <input type="radio" value="asc" name="sort"
                            checked={this.state.sort === "asc"} />Ascending
                        <input type="radio" value="dec" name="sort"
                            checked={this.state.sort === "dec"} />Descending
                    </div>
                    <div>{moves}</div>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares, winCondition) {
    const testCase = (winner, fx, fy) => {
        const cells = [{ x: fx(0), y: fy(0) }];
        for (let i = 1; i < winCondition; i++) {
            if (squares[fx(i)][fy(i)] !== winner) {
                return false;
            }
            cells.push({ x: fx(i), y: fy(i) });
        }
        return cells;
    }

    for (let x = 0; x < squares.length; x++) {
        for (let y = 0; y < squares[x].length; y++) {
            const winner = squares[x][y];
            const result = winner && ((
                squares.length - x >= winCondition
                && testCase(winner, i => x + i, i => y)
            ) || (
                    squares[x].length - y >= winCondition
                    && testCase(winner, i => x, i => y + i)
                ) || (
                    squares.length - x >= winCondition
                    && squares[x].length - y >= winCondition
                    && testCase(winner, i => x + i, i => y + i)
                ) || (
                    squares.length - x >= winCondition
                    && y >= winCondition - 1
                    && testCase(winner, i => x + i, i => y - i)
                ));

            if (result) {
                return { marker: winner, cells: result };
            }
        }
    }
    return null;
}

const App = () => {
    const defaultRows = 3;
    const defaultColumns = 3;
    const defaultWinCondition = 3;

    const [input, setInput] = useState({
        rows: defaultRows,
        columns: defaultColumns,
        winCondition: defaultWinCondition,
    });
    const [game, setGame] = useState(null);

    const handleInputChange = e => setInput({
        ...input,
        [e.currentTarget.name]: e.currentTarget.value,
    });

    const handleClick = () => setGame(
        <Game key={`${input.rows}/${input.columns}/${input.winCondition}`}
            rows={input.rows} columns={input.columns}
            winCondition={input.winCondition} />
    );

    return <>
        <h1>Big-Tac-Toe</h1>
        <label>Rows:</label>
        <input name="rows" placeholder={defaultRows} onChange={handleInputChange} />
        <label>Columns:</label>
        <input name="columns" placeholder={defaultColumns} onChange={handleInputChange} />
        <label>Win condition:</label>
        <input name="winCondition" placeholder={defaultWinCondition} onChange={handleInputChange} />
        <button onClick={handleClick}>Start Game</button>
        {game}
    </>;
}

export default App;
