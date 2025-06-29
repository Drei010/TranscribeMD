// Speech Recognition Module
class SpeechTranscriber {
    constructor() {
        this.recognition = null;
        this.isTranscribing = false;
        this.finalTranscript = '';
        this.interimTranscript = '';
        this.transcriptionElement = null;
        this.initializeSpeechRecognition();
    }

    // Initialize Speech Recognition
    initializeSpeechRecognition() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('Speech recognition not supported in this browser');
            return;
        }

        this.recognition = new SpeechRecognition();
        
        // Configure recognition
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = 'en-US';

        // Set up event handlers
        this.recognition.onstart = () => {
            this.isTranscribing = true;
            console.log('Speech recognition started');
        };

        this.recognition.onend = () => {
            this.isTranscribing = false;
            console.log('Speech recognition ended');
            
            // Restart if recording is still active
            if (audioRecorder && audioRecorder.getIsRecording() && !audioRecorder.getIsPaused()) {
                this.start();
            }
        };

        this.recognition.onresult = (event) => {
            this.handleTranscriptionResult(event);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.handleError(event.error);
        };
    }

    // Start transcription
    start() {
        if (!this.recognition) {
            alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        try {
            this.transcriptionElement = document.getElementById('transcriptionBox');
            this.clearTranscription();
            this.recognition.start();
        } catch (error) {
            console.error('Error starting transcription:', error);
        }
    }

    // Stop transcription
    stop() {
        if (this.recognition && this.isTranscribing) {
            this.recognition.stop();
        }
    }

    // Pause transcription
    pause() {
        if (this.recognition && this.isTranscribing) {
            this.recognition.stop();
        }
    }

    // Resume transcription
    resume() {
        if (this.recognition && !this.isTranscribing) {
            this.start();
        }
    }

    // Handle transcription results
    handleTranscriptionResult(event) {
        this.interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                this.finalTranscript += transcript + ' ';
            } else {
                this.interimTranscript += transcript;
            }
        }

        this.updateTranscriptionDisplay();
    }

    // Update transcription display
    updateTranscriptionDisplay() {
        if (!this.transcriptionElement) return;

        const finalParagraph = this.createTranscriptParagraph(this.finalTranscript, false);
        const interimParagraph = this.createTranscriptParagraph(this.interimTranscript, true);

        this.transcriptionElement.innerHTML = '';
        
        if (this.finalTranscript) {
            this.transcriptionElement.appendChild(finalParagraph);
        }
        
        if (this.interimTranscript) {
            this.transcriptionElement.appendChild(interimParagraph);
        }

        // Auto-scroll to bottom
        this.transcriptionElement.scrollTop = this.transcriptionElement.scrollHeight;
    }

    // Create transcript paragraph
    createTranscriptParagraph(text, isInterim) {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        
        if (isInterim) {
            paragraph.classList.add('interim');
        }
        
        return paragraph;
    }

    // Clear transcription
    clearTranscription() {
        this.finalTranscript = '';
        this.interimTranscript = '';
        
        if (this.transcriptionElement) {
            this.transcriptionElement.innerHTML = '<p class="placeholder">Start recording to see live transcription...</p>';
        }
    }

    // Get full transcript
    getFullTranscript() {
        return this.finalTranscript.trim();
    }

    // Handle errors
    handleError(error) {
        let message = '';
        
        switch(error) {
            case 'no-speech':
                message = 'No speech detected. Please speak clearly into the microphone.';
                break;
            case 'audio-capture':
                message = 'No microphone found. Please ensure a microphone is connected.';
                break;
            case 'not-allowed':
                message = 'Microphone access denied. Please allow microphone access and reload the page.';
                break;
            case 'network':
                message = 'Network error occurred. Please check your internet connection.';
                break;
            default:
                message = `Speech recognition error: ${error}`;
        }
        
        if (this.transcriptionElement && error !== 'no-speech') {
            const errorParagraph = document.createElement('p');
            errorParagraph.style.color = 'red';
            errorParagraph.textContent = message;
            this.transcriptionElement.appendChild(errorParagraph);
        }
    }

    // Extract medical information from transcript
    extractMedicalInfo(transcript) {
        const medicalInfo = {
            symptoms: [],
            medications: [],
            diagnosis: '',
            allergies: [],
            vitals: {}
        };

        // Simple keyword extraction (can be enhanced with NLP)
        const lines = transcript.toLowerCase().split('.');
        
        lines.forEach(line => {
            // Extract symptoms
            if (line.includes('symptom') || line.includes('complain') || line.includes('pain') || line.includes('ache')) {
                medicalInfo.symptoms.push(line.trim());
            }
            
            // Extract medications
            const medicationKeywords = ['prescribe', 'medication', 'medicine', 'drug', 'tablet', 'capsule', 'syrup'];
            if (medicationKeywords.some(keyword => line.includes(keyword))) {
                medicalInfo.medications.push(line.trim());
            }
            
            // Extract diagnosis
            if (line.includes('diagnosis') || line.includes('condition') || line.includes('disease')) {
                medicalInfo.diagnosis = line.trim();
            }
            
            // Extract allergies
            if (line.includes('allerg')) {
                medicalInfo.allergies.push(line.trim());
            }
            
            // Extract vitals
            const vitalMatches = line.match(/blood pressure|bp|temperature|pulse|heart rate/);
            if (vitalMatches) {
                const numberMatch = line.match(/\d+/g);
                if (numberMatch) {
                    medicalInfo.vitals[vitalMatches[0]] = numberMatch.join('/');
                }
            }
        });

        return medicalInfo;
    }
}

// Create global instance
const speechTranscriber = new SpeechTranscriber(); 