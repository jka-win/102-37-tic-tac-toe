
import React, {useState} from "react"

const Square = props =>
    <button className="square" onClick={props.onClick}>
        {props.value}
    </button>;

class Board extends React.Component {
    renderSquare(x, y) {
        return <Square key={`${x},${y}`}
            value={this.props.squares[x][y]} 
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
            }],
            stepNumber: 0,
            xIsNext: true,
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
        squares[x][y] = this.currentMarker();
        this.setState({
            history: history.concat([{
                squares: squares
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
        
        const moves = history.map((step, move) => {
            const desc = move ? `Go to move #${move}` : "Go to game start";
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = `Winner: ${winner}`;
        } else {
            status = `Next player: ${this.currentMarker()}`;
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board rows={this.props.rows} columns={this.props.columns}
                        squares={current.squares}
                        onClick={(x, y) => this.handleClick(x, y)} />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares, winCondition) {
    const testCase = (winner, fx, fy) => {
        for (let i = 1; i < winCondition; i++) {
            if (squares[fx(i)][fy(i)] !== winner) {
                return false;
            }
        }
        return true;
    }

    for (let x = 0; x < squares.length; x++) {
        for (let y = 0; y < squares[x].length; y++) {
            const winner = squares[x][y];
            if (winner && ((
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
                ))) {
                return winner;
            }
        }
    }
    return null;
}

const App = () => {
    const defaultRows = 9;
    const defaultColumns = 16;
    const defaultWinCondition = 5;

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
