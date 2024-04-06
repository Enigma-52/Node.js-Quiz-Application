document.addEventListener('DOMContentLoaded', () => {
    // Get references to HTML elements
    const quizContainer = document.getElementById('quiz');
    const submitButton = document.getElementById('submit');
    const feedbackContainer = document.getElementById('feedback');

    let data;

    // Fetch quiz questions from the server
    fetch('/api/questions')
        .then(response => response.json())
        .then(quizData => {
            data = quizData;
            // Loop through each question and create HTML elements to display them
            data.questions.forEach((question, index) => {
                const questionElement = document.createElement('div');
                questionElement.innerHTML = `
            <h3>${index + 1}. ${question.question}</h3>
            <ul>
              ${question.options.map((option, i) => `
                <li>
                  <input type="radio" name="question${index}" value="${i}">
                  <label>${option}</label>
                </li>
              `).join('')}
            </ul>
          `;
                quizContainer.appendChild(questionElement);
            });
        });

    // Event listener for submit button click
    submitButton.addEventListener('click', () => {
        const answers = [];
        const answerElements = document.querySelectorAll('input[type="radio"]:checked');

        // Check if all questions have been answered
        if (answerElements.length !== data.questions.length) {
            alert('Please answer all questions before submitting.');
            return;
        }

        // Collect selected answers
        answerElements.forEach(answer => {
            answers.push(parseInt(answer.value));
        });

        // Send user answers to the server for scoring
        fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    answers
                })
            })
            .then(response => response.json())
            .then(data => {
                // Hide quiz and display feedback
                quizContainer.style.display = 'none';
                feedbackContainer.style.display = 'block';
                submitButton.style.display = 'none';
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                // Display result feedback
                displayResult(data);
            });
    });

    // Function to display quiz result feedback
    function displayResult(result) {
        const scoreContainer = document.createElement('div');
        scoreContainer.innerHTML = `
          <h2>Your Score: ${result.score} / ${result.totalQuestions}</h2>
        `;
        feedbackContainer.innerHTML = '';
        feedbackContainer.appendChild(scoreContainer);

        const feedbackHeader = document.createElement('h3');
        feedbackHeader.textContent = 'Feedback:';
        feedbackContainer.appendChild(feedbackHeader);

        // Loop through each feedback item and display details
        result.feedback.forEach((feedback, index) => {
            const feedbackElement = document.createElement('p');
            feedbackElement.innerHTML = `<b>Question ${index + 1}: ${feedback.question}</b>`;
            feedbackContainer.appendChild(feedbackElement);

            const userAnswerElement = document.createElement('p');
            userAnswerElement.innerHTML = `<b>Your Answer:</b> ${feedback.userAnswer}`;
            feedbackContainer.appendChild(userAnswerElement);

            const correctAnswerElement = document.createElement('p');
            correctAnswerElement.innerHTML = `<b>Correct Answer:</b> ${feedback.correctAnswer}`;
            feedbackContainer.appendChild(correctAnswerElement);

            const correctAnswerStatus = document.createElement('p');
            correctAnswerStatus.textContent = feedback.isCorrect ? 'Correct' : 'Incorrect';
            correctAnswerStatus.style.color = feedback.isCorrect ? 'green' : 'red';
            feedbackContainer.appendChild(correctAnswerStatus);

            const lineBreak = document.createElement('hr');
            feedbackContainer.appendChild(lineBreak);
        });
    }
});
