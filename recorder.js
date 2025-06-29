// Audio Recorder Module
class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        this.isRecording = false;
        this.isPaused = false;
        this.startTime = null;
        this.pausedTime = 0;
        this.timerInterval = null;
    }

    // Initialize the recorder
    async init() {
        try {
            // Request microphone access
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });
            
            // Create MediaRecorder instance
            const mimeType = this.getSupportedMimeType();
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: mimeType
            });

            // Set up event handlers
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.onRecordingStop();
            };

            this.mediaRecorder.onpause = () => {
                this.isPaused = true;
            };

            this.mediaRecorder.onresume = () => {
                this.isPaused = false;
            };

            return true;
        } catch (error) {
            console.error('Error initializing recorder:', error);
            this.handleError(error);
            return false;
        }
    }

    // Get supported MIME type
    getSupportedMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/ogg',
            'audio/mp4',
            'audio/mpeg'
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }

        return 'audio/webm'; // Default fallback
    }

    // Start recording
    async start() {
        if (!this.mediaRecorder) {
            const initialized = await this.init();
            if (!initialized) return false;
        }

        try {
            this.audioChunks = [];
            this.startTime = Date.now();
            this.pausedTime = 0;
            this.mediaRecorder.start(1000); // Collect data every second
            this.isRecording = true;
            this.isPaused = false;
            this.startTimer();
            return true;
        } catch (error) {
            console.error('Error starting recording:', error);
            this.handleError(error);
            return false;
        }
    }

    // Stop recording
    stop() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.isPaused = false;
            this.stopTimer();
            
            // Stop all tracks to release microphone
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }
        }
    }

    // Pause recording
    pause() {
        if (this.mediaRecorder && this.isRecording && !this.isPaused) {
            this.mediaRecorder.pause();
            this.pausedTime += Date.now() - this.startTime;
        }
    }

    // Resume recording
    resume() {
        if (this.mediaRecorder && this.isRecording && this.isPaused) {
            this.mediaRecorder.resume();
            this.startTime = Date.now();
        }
    }

    // Handle recording stop
    onRecordingStop() {
        const audioBlob = new Blob(this.audioChunks, { 
            type: this.mediaRecorder.mimeType 
        });
        
        // Create audio URL for playback
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Trigger custom event with audio data
        const event = new CustomEvent('recordingComplete', {
            detail: {
                blob: audioBlob,
                url: audioUrl,
                duration: this.getRecordingDuration()
            }
        });
        window.dispatchEvent(event);
    }

    // Get recording duration
    getRecordingDuration() {
        if (!this.startTime) return 0;
        
        const currentTime = this.isPaused ? 0 : (Date.now() - this.startTime);
        return this.pausedTime + currentTime;
    }

    // Format time for display
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Start timer
    startTimer() {
        this.updateTimer();
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    // Stop timer
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // Update timer display
    updateTimer() {
        const duration = this.getRecordingDuration();
        const timeDisplay = document.getElementById('recordingTime');
        if (timeDisplay) {
            timeDisplay.textContent = this.formatTime(duration);
        }
    }

    // Handle errors
    handleError(error) {
        let message = 'An error occurred while accessing the microphone.';
        
        if (error.name === 'NotAllowedError') {
            message = 'Microphone access was denied. Please allow microphone access and try again.';
        } else if (error.name === 'NotFoundError') {
            message = 'No microphone found. Please connect a microphone and try again.';
        } else if (error.name === 'NotReadableError') {
            message = 'Microphone is already in use by another application.';
        }
        
        alert(message);
    }

    // Check if recording is active
    getIsRecording() {
        return this.isRecording;
    }

    // Check if recording is paused
    getIsPaused() {
        return this.isPaused;
    }
}

// Create global instance
const audioRecorder = new AudioRecorder(); 