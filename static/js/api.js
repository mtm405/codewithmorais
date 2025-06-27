/**
 * API Module
 * 
 * This module centralizes all fetch calls to the backend API.
 * It provides a clean and reusable interface for interacting with server-side endpoints.
 */

// Utility: Send quiz result to backend (Flask API) for progress, points, currency
export async function submitQuizResult({ questionId, isCorrect, points = 0, currency = 0, answer = null }) {
    try {
        const res = await fetch("/api/quiz/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question_id: questionId,
                correct: isCorrect,
                points,
                currency,
                answer
            })
        });
        return await res.json();
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// Utility: Purchase a hint from the backend
export async function purchaseHint(blockId, hintCost) {
    try {
        const res = await fetch("/api/quiz/purchase_hint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                block_id: blockId,
                cost: hintCost
            })
        });
        return await res.json();
    } catch (e) {
        return { success: false, error: e.message };
    }
}
