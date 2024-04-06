const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const quizQuestions = require('./quiz.json');

// Endpoint to serve quiz questions
app.get('/api/questions', (req, res, next) => {
    try {
        res.json(quizQuestions);
    } catch (error) {
        console.error("Error in fetching Questions:", error);
        next(error);
    }
});

// Endpoint to handle user submissions
app.post('/api/submit', (req, res, next) => {
    try {
        const userAnswers = req.body.answers;
        let score = 0;
        const feedback = [];

        quizQuestions.questions.forEach((question, index) => {
            const correctAnswerIndex = question.correctAnswer;
            const userAnswerIndex = userAnswers[index];
            const correctAnswer = question.options[correctAnswerIndex];
            const userAnswer = question.options[userAnswerIndex];

            // Check if the user's answer is correct
            if (correctAnswerIndex === userAnswerIndex) {
                score++;
                feedback.push({
                    question: question.question,
                    userAnswer,
                    correctAnswer,
                    isCorrect: true
                });
            } else {
                feedback.push({
                    question: question.question,
                    userAnswer,
                    correctAnswer,
                    isCorrect: false
                });
            }
        });

        const result = {
            score,
            totalQuestions: quizQuestions.questions.length,
            feedback
        };

        res.json(result);
    } catch (error) {
        console.error("Error in calculating Answers:", error);
        next(error);
    }
});

// Error handling middleware for invalid requests or unexpected errors
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message || 'Internal Server Error'
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});