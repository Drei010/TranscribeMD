// Storage Manager for prescriptions and recordings
class StorageManager {
    constructor() {
        this.PRESCRIPTIONS_KEY = 'doctor_patient_prescriptions';
        this.MAX_PRESCRIPTIONS = 50;
    }

    // Save prescription to local storage
    savePrescription(prescription) {
        try {
            const prescriptions = this.getPrescriptions();
            
            // Add timestamp and ID
            prescription.id = Date.now().toString();
            prescription.timestamp = new Date().toISOString();
            
            // Add to beginning of array
            prescriptions.unshift(prescription);
            
            // Keep only the latest MAX_PRESCRIPTIONS
            if (prescriptions.length > this.MAX_PRESCRIPTIONS) {
                prescriptions.splice(this.MAX_PRESCRIPTIONS);
            }
            
            localStorage.setItem(this.PRESCRIPTIONS_KEY, JSON.stringify(prescriptions));
            return prescription.id;
        } catch (error) {
            console.error('Error saving prescription:', error);
            return null;
        }
    }

    // Get all prescriptions
    getPrescriptions() {
        try {
            const data = localStorage.getItem(this.PRESCRIPTIONS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error retrieving prescriptions:', error);
            return [];
        }
    }

    // Get a single prescription by ID
    getPrescription(id) {
        const prescriptions = this.getPrescriptions();
        return prescriptions.find(p => p.id === id);
    }

    // Delete a prescription
    deletePrescription(id) {
        try {
            const prescriptions = this.getPrescriptions();
            const filtered = prescriptions.filter(p => p.id !== id);
            localStorage.setItem(this.PRESCRIPTIONS_KEY, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Error deleting prescription:', error);
            return false;
        }
    }

    // Clear all prescriptions
    clearAllPrescriptions() {
        try {
            localStorage.removeItem(this.PRESCRIPTIONS_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing prescriptions:', error);
            return false;
        }
    }

    // Format date for display
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }

    // Export prescription as text
    exportPrescriptionText(prescription) {
        let text = `PRESCRIPTION SUMMARY\n`;
        text += `Date: ${this.formatDate(prescription.timestamp)}\n`;
        text += `Patient: ${prescription.patientName || 'Not specified'}\n\n`;
        
        if (prescription.diagnosis) {
            text += `DIAGNOSIS:\n${prescription.diagnosis}\n\n`;
        }
        
        if (prescription.medications && prescription.medications.length > 0) {
            text += `MEDICATIONS:\n`;
            prescription.medications.forEach((med, index) => {
                text += `${index + 1}. ${med.name}`;
                if (med.dosage) text += ` - ${med.dosage}`;
                if (med.frequency) text += ` - ${med.frequency}`;
                if (med.duration) text += ` - ${med.duration}`;
                text += '\n';
            });
            text += '\n';
        }
        
        if (prescription.instructions) {
            text += `INSTRUCTIONS:\n${prescription.instructions}\n\n`;
        }
        
        if (prescription.followUp) {
            text += `FOLLOW-UP:\n${prescription.followUp}\n`;
        }
        
        return text;
    }
}

// Create global instance
const storageManager = new StorageManager(); 