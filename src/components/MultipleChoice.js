import React, { useState } from 'react';

function MultipleChoice({ options, correctIndex, onNext, isLastQuestion }) {
    const [selected, setSelected] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const handleSelect = (idx) => {
        if (showAnswer) return;
        setSelected(idx);
        setShowAnswer(true);
        if (idx === correctIndex) {
            setShowConfetti(true);
        }
        setTimeout(() => {
            setShowConfetti(false);
            setShowAnswer(false);
            setSelected(null);
            if (onNext) onNext();
        }, 2000);
    };

    return (
        <div>
            {showConfetti && <div className="confetti">🎉</div>}
            {options.map((option, idx) => {
                let style = {};
                if (showAnswer) {
                    if (idx === correctIndex) {
                        style = { backgroundColor: 'green', color: 'white' };
                    }
                    if (idx === selected && idx !== correctIndex) {
                        style = { backgroundColor: 'red', color: 'white' };
                    }
                }
                return (
                    <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        style={style}
                        disabled={showAnswer}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
    );
}

export default MultipleChoice;