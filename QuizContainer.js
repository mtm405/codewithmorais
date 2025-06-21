import React from 'react';
import MultipleChoice from './MultipleChoice';

function QuizContainer({ questions, currentIndex, onNext }) {
    const question = questions[currentIndex];

    if (question.type === "multiple_choice_quiz") {
        return (
            <MultipleChoice
                options={question.options}
                correctIndex={question.correctIndex}
                onNext={onNext}
                isLastQuestion={currentIndex === questions.length - 1}
            />
        );
    }

    // ...existing code for other question types...
    return (
        // ...existing code...
    );
}

export default QuizContainer;