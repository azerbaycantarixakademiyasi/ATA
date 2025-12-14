document.addEventListener('DOMContentLoaded', () => {
    const questionInput = document.getElementById('questionInput');
    const sendButton = document.getElementById('sendButton');
    const responseDisplay = document.getElementById('responseDisplay');
    const formatButtons = document.querySelectorAll('.format-button');

    let selectedFormat = 'paragraph'; // Default format
    
    // ==================================================================
    // BU URL RENDER-DƏN ALDIĞINIZ BACKEND ÜNVANI OLACAQ!
    // Hazırda lokal test və ya boş olaraq qalır.
    // Nümunə: 'https://ata-si-backend.onrender.com/api/ata_chat';
    // ==================================================================
    const BACKEND_URL = 'https://ata-si-backend.onrender.com/api/ata_chat'; // Render URL-inizi bura qoyun!

    // Format seçimi üçün hadisələr
    formatButtons.forEach(button => {
        button.addEventListener('click', () => {
            formatButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedFormat = button.dataset.format;
        });
    });

    sendButton.addEventListener('click', handleSend);
    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });

    async function handleSend() {
        const question = questionInput.value.trim();
        
        if (!selectedFormat) {
            alert('Zəhmət olmasa, əvvəlcə cavab formatını seçin.');
            return;
        }

        if (question === '') {
            return;
        }
        
        addMessage(question, 'user');

        questionInput.value = '';
        questionInput.disabled = true;
        sendButton.disabled = true;

        const loadingMessageId = addMessage("Axtarış aparılır və cavab hazırlanır...", 'bot', true);

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    question: question,
                    format: selectedFormat 
                })
            });

            const data = await response.json();
            
            document.getElementById(loadingMessageId).remove();
            
            if (data.success) {
                addMessage(data.answer, 'bot');
            } else {
                addMessage(`Xəta: ${data.message}`, 'bot');
            }

        } catch (error) {
            document.getElementById(loadingMessageId).remove();
            addMessage("Bağlantı xətası: Backend serverinizə qoşulmaq mümkün olmadı.", 'bot');
            console.error('API Xətası:', error);
        } finally {
            questionInput.disabled = false;
            sendButton.disabled = false;
            questionInput.focus();
        }
    }

    function addMessage(text, sender, isLoading = false) {
        const messageDiv = document.createElement('div');
        const messageId = `msg-${Date.now()}`;
        messageDiv.id = messageId;
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender + '-message');
        
        const content = document.createElement('p');
        content.innerHTML = text.replace(/\n/g, '<br>');
        
        messageDiv.appendChild(content);
        responseDisplay.appendChild(messageDiv);
        
        responseDisplay.scrollTop = responseDisplay.scrollHeight;

        return messageId;
    }
});
