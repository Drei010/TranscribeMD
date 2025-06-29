// Main Application Controller
class DoctorPatientRecorderApp {
    constructor() {
        this.currentPrescription = null;
        this.initializeEventListeners();
        this.loadSavedPrescriptions();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Recording controls
        document.getElementById('startBtn').addEventListener('click', () => this.startRecording());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopRecording());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());

        // Prescription actions
        document.getElementById('saveBtn').addEventListener('click', () => this.savePrescription());
        document.getElementById('printBtn').addEventListener('click', () => this.printPrescription());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearPrescription());

        // Listen for recording complete event
        window.addEventListener('recordingComplete', (event) => this.handleRecordingComplete(event));
    }

    // Start recording
    async startRecording() {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const indicator = document.getElementById('recordingIndicator');

        // Start audio recording
        const recordingStarted = await audioRecorder.start();
        if (!recordingStarted) {
            return;
        }

        // Start speech transcription
        speechTranscriber.start();

        // Update UI
        startBtn.disabled = true;
        stopBtn.disabled = false;
        pauseBtn.disabled = false;
        indicator.classList.add('recording');

        // Clear previous prescription
        this.clearPrescription();
    }

    // Stop recording
    stopRecording() {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const indicator = document.getElementById('recordingIndicator');

        // Stop recording and transcription
        audioRecorder.stop();
        speechTranscriber.stop();

        // Update UI
        startBtn.disabled = false;
        stopBtn.disabled = true;
        pauseBtn.disabled = true;
        pauseBtn.textContent = 'Pause';
        indicator.classList.remove('recording');

        // Process transcript
        this.processTranscript();
    }

    // Toggle pause
    togglePause() {
        const pauseBtn = document.getElementById('pauseBtn');

        if (audioRecorder.getIsPaused()) {
            audioRecorder.resume();
            speechTranscriber.resume();
            pauseBtn.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                    <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                </svg>
                Pause
            `;
        } else {
            audioRecorder.pause();
            speechTranscriber.pause();
            pauseBtn.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                </svg>
                Resume
            `;
        }
    }

    // Handle recording complete
    handleRecordingComplete(event) {
        console.log('Recording complete:', event.detail);
        // Audio blob is available in event.detail.blob if needed for playback
    }

    // Process transcript and generate prescription
    processTranscript() {
        const transcript = speechTranscriber.getFullTranscript();
        
        console.log('Processing transcript:', transcript);
        
        if (!transcript) {
            this.showMessage('No transcript available. Please record a conversation first.');
            return;
        }

        // Generate prescription from transcript
        this.currentPrescription = prescriptionSummarizer.generatePrescription(transcript);
        
        console.log('Generated prescription:', this.currentPrescription);
        
        // Display prescription
        this.displayPrescription(this.currentPrescription);
    }

    // Display prescription
    displayPrescription(prescription) {
        const outputElement = document.getElementById('prescriptionOutput');
        const actionsElement = document.getElementById('prescriptionActions');

        // Generate and display HTML
        outputElement.innerHTML = prescriptionSummarizer.formatPrescriptionHTML(prescription);
        
        // Show actions
        actionsElement.style.display = 'flex';
    }

    // Save prescription
    savePrescription() {
        if (!this.currentPrescription) {
            this.showMessage('No prescription to save.');
            return;
        }

        // Prompt for patient name if not already set
        if (this.currentPrescription.patientName === 'Patient Name') {
            const name = prompt('Enter patient name:');
            if (name) {
                this.currentPrescription.patientName = name;
                this.displayPrescription(this.currentPrescription);
            }
        }

        // Save to storage
        const id = storageManager.savePrescription(this.currentPrescription);
        
        if (id) {
            this.showMessage('Prescription saved successfully!');
            this.loadSavedPrescriptions();
        } else {
            this.showMessage('Error saving prescription. Please try again.');
        }
    }

    // Print prescription
    printPrescription() {
        if (!this.currentPrescription) {
            this.showMessage('No prescription to print.');
            return;
        }

        window.print();
    }

    // Clear prescription
    clearPrescription() {
        this.currentPrescription = null;
        
        const outputElement = document.getElementById('prescriptionOutput');
        const actionsElement = document.getElementById('prescriptionActions');
        
        outputElement.innerHTML = '<p class="placeholder">Prescription will appear here after recording...</p>';
        actionsElement.style.display = 'none';
    }

    // Load saved prescriptions
    loadSavedPrescriptions() {
        const savedElement = document.getElementById('savedPrescriptions');
        const prescriptions = storageManager.getPrescriptions();

        if (prescriptions.length === 0) {
            savedElement.innerHTML = '<p class="placeholder">No saved prescriptions yet...</p>';
            return;
        }

        savedElement.innerHTML = '';
        
        // Display recent prescriptions (limit to 10)
        const recentPrescriptions = prescriptions.slice(0, 10);
        
        recentPrescriptions.forEach(prescription => {
            const card = this.createPrescriptionCard(prescription);
            savedElement.appendChild(card);
        });
    }

    // Create prescription card
    createPrescriptionCard(prescription) {
        const card = document.createElement('div');
        card.className = 'prescription-card';
        
        const date = document.createElement('div');
        date.className = 'date';
        date.textContent = storageManager.formatDate(prescription.timestamp);
        
        const patientName = document.createElement('div');
        patientName.className = 'patient-name';
        patientName.textContent = prescription.patientName;
        
        const medications = document.createElement('div');
        medications.className = 'medications';
        if (prescription.medications.length > 0) {
            const medNames = prescription.medications.map(m => m.name).join(', ');
            medications.textContent = `Medications: ${medNames}`;
        } else {
            medications.textContent = 'No medications prescribed';
        }
        
        card.appendChild(date);
        card.appendChild(patientName);
        card.appendChild(medications);
        
        // Click to view
        card.addEventListener('click', () => {
            this.currentPrescription = prescription;
            this.displayPrescription(prescription);
            
            // Scroll to prescription section
            document.querySelector('.prescription-section').scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
        
        return card;
    }

    // Show message to user
    showMessage(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new DoctorPatientRecorderApp();
    
    // Check browser compatibility
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Edge.');
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('Your browser does not support speech recognition. For best results, please use Chrome, Edge, or Safari.');
    }
}); 