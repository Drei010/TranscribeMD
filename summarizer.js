// Prescription Summarizer Module
class PrescriptionSummarizer {
    constructor() {
        this.medicationDatabase = this.initMedicationDatabase();
    }

    // Initialize a simple medication database
    initMedicationDatabase() {
        return {
            'pain': ['Ibuprofen', 'Acetaminophen', 'Aspirin', 'Naproxen'],
            'infection': ['Amoxicillin', 'Azithromycin', 'Ciprofloxacin', 'Doxycycline'],
            'allergy': ['Cetirizine', 'Loratadine', 'Diphenhydramine', 'Fexofenadine'],
            'stomach': ['Omeprazole', 'Ranitidine', 'Pantoprazole', 'Famotidine'],
            'anxiety': ['Alprazolam', 'Diazepam', 'Lorazepam', 'Buspirone'],
            'depression': ['Sertraline', 'Fluoxetine', 'Citalopram', 'Escitalopram'],
            'diabetes': ['Metformin', 'Glipizide', 'Insulin', 'Sitagliptin'],
            'blood pressure': ['Lisinopril', 'Amlodipine', 'Metoprolol', 'Losartan'],
            'cholesterol': ['Atorvastatin', 'Simvastatin', 'Rosuvastatin', 'Pravastatin'],
            'asthma': ['Albuterol', 'Budesonide', 'Montelukast', 'Fluticasone']
        };
    }

    // Generate prescription from transcript
    generatePrescription(transcript) {
        if (!transcript || transcript.trim().length === 0) {
            return this.createEmptyPrescription();
        }

        // Extract medical information
        const medicalInfo = this.extractDetailedMedicalInfo(transcript);
        
        // Create prescription object
        const prescription = {
            patientName: medicalInfo.patientName || 'Patient Name',
            date: new Date().toLocaleDateString(),
            diagnosis: medicalInfo.diagnosis || 'To be determined',
            symptoms: medicalInfo.symptoms.length > 0 ? medicalInfo.symptoms : ['No specific symptoms recorded'],
            medications: this.processMedications(medicalInfo.medications, medicalInfo.symptoms),
            instructions: this.generateInstructions(medicalInfo),
            followUp: medicalInfo.followUp || 'Follow up in 2 weeks or if symptoms persist',
            warnings: this.generateWarnings(medicalInfo),
            transcript: transcript
        };

        return prescription;
    }

    // Extract detailed medical information from transcript
    extractDetailedMedicalInfo(transcript) {
        const info = {
            patientName: '',
            symptoms: [],
            medications: [],
            diagnosis: '',
            allergies: [],
            vitals: {},
            followUp: '',
            dosages: {}
        };

        const sentences = transcript.split(/[.!?]+/).filter(s => s.trim());
        
        sentences.forEach(sentence => {
            const lowerSentence = sentence.toLowerCase().trim();
            
            // Extract patient name
            if (lowerSentence.includes('patient') && lowerSentence.includes('name')) {
                const nameMatch = sentence.match(/(?:patient|name|is|:)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
                if (nameMatch) {
                    info.patientName = nameMatch[1];
                }
            }
            
            // Extract symptoms
            const symptomKeywords = ['complain', 'symptom', 'pain', 'ache', 'fever', 'cough', 'nausea', 'dizzy', 'fatigue', 'weak', 'sore', 'swollen'];
            if (symptomKeywords.some(keyword => lowerSentence.includes(keyword))) {
                info.symptoms.push(this.cleanSentence(sentence));
            }
            
            // Extract medications with dosage
            const medKeywords = ['prescribe', 'medication', 'medicine', 'take', 'tablet', 'capsule', 'mg', 'milligram', 'dose'];
            if (medKeywords.some(keyword => lowerSentence.includes(keyword))) {
                const medInfo = this.extractMedicationInfo(sentence);
                if (medInfo) {
                    info.medications.push(medInfo);
                }
            }
            
            // Extract diagnosis
            if (lowerSentence.includes('diagnosis') || lowerSentence.includes('diagnose')) {
                info.diagnosis = this.cleanSentence(sentence.replace(/.*(?:diagnosis|diagnose)[:\s]+/i, ''));
            }
            
            // Extract allergies
            if (lowerSentence.includes('allerg')) {
                info.allergies.push(this.cleanSentence(sentence));
            }
            
            // Extract follow-up
            if (lowerSentence.includes('follow up') || lowerSentence.includes('return') || lowerSentence.includes('come back')) {
                info.followUp = this.cleanSentence(sentence);
            }
            
            // Extract vitals
            this.extractVitals(sentence, info.vitals);
        });

        return info;
    }

    // Extract medication information from sentence
    extractMedicationInfo(sentence) {
        const medInfo = {
            name: '',
            dosage: '',
            frequency: '',
            duration: ''
        };

        // Extract medication name (simple approach - looks for capitalized words)
        const nameMatch = sentence.match(/([A-Z][a-z]+(?:in|ol|am|ide|ate|ine)?)/);
        if (nameMatch) {
            medInfo.name = nameMatch[1];
        }

        // Extract dosage
        const dosageMatch = sentence.match(/(\d+(?:\.\d+)?)\s*(?:mg|milligram|ml|cc)/i);
        if (dosageMatch) {
            medInfo.dosage = dosageMatch[0];
        }

        // Extract frequency
        const freqPatterns = [
            /(?:once|twice|three times|four times)\s+(?:a|per)\s+day/i,
            /every\s+\d+\s+hours?/i,
            /\b(?:daily|bid|tid|qid|prn)\b/i,
            /(?:morning|evening|night|bedtime)/i
        ];
        
        for (const pattern of freqPatterns) {
            const match = sentence.match(pattern);
            if (match) {
                medInfo.frequency = match[0];
                break;
            }
        }

        // Extract duration
        const durationMatch = sentence.match(/(?:for\s+)?(\d+)\s+(?:days?|weeks?|months?)/i);
        if (durationMatch) {
            medInfo.duration = durationMatch[0];
        }

        return medInfo.name ? medInfo : null;
    }

    // Extract vitals from sentence
    extractVitals(sentence, vitals) {
        // Blood pressure
        const bpMatch = sentence.match(/(?:blood pressure|bp)[:\s]+(\d+\/\d+)/i);
        if (bpMatch) {
            vitals.bloodPressure = bpMatch[1];
        }

        // Temperature
        const tempMatch = sentence.match(/(?:temperature|temp)[:\s]+(\d+(?:\.\d+)?)\s*(?:°?[FC])?/i);
        if (tempMatch) {
            vitals.temperature = tempMatch[1];
        }

        // Heart rate
        const hrMatch = sentence.match(/(?:heart rate|pulse|hr)[:\s]+(\d+)/i);
        if (hrMatch) {
            vitals.heartRate = hrMatch[1];
        }

        // Respiratory rate
        const rrMatch = sentence.match(/(?:respiratory rate|rr)[:\s]+(\d+)/i);
        if (rrMatch) {
            vitals.respiratoryRate = rrMatch[1];
        }
    }

    // Process medications
    processMedications(extractedMeds, symptoms) {
        const medications = [];
        
        // If medications were extracted from transcript
        if (extractedMeds && extractedMeds.length > 0) {
            extractedMeds.forEach(med => {
                if (typeof med === 'string') {
                    medications.push(this.createMedicationObject(med));
                } else if (med.name) {
                    medications.push({
                        name: med.name,
                        dosage: med.dosage || 'As directed',
                        frequency: med.frequency || 'As prescribed',
                        duration: med.duration || 'Until finished'
                    });
                }
            });
        }
        
        // If no medications found, suggest based on symptoms
        if (medications.length === 0 && symptoms.length > 0) {
            const suggestedMeds = this.suggestMedications(symptoms);
            medications.push(...suggestedMeds);
        }

        return medications;
    }

    // Suggest medications based on symptoms
    suggestMedications(symptoms) {
        const suggestions = [];
        const symptomText = symptoms.join(' ').toLowerCase();
        
        Object.keys(this.medicationDatabase).forEach(condition => {
            if (symptomText.includes(condition)) {
                const meds = this.medicationDatabase[condition];
                if (meds.length > 0) {
                    suggestions.push({
                        name: meds[0],
                        dosage: 'As directed by physician',
                        frequency: 'As prescribed',
                        duration: 'Until symptoms resolve'
                    });
                }
            }
        });

        return suggestions;
    }

    // Create medication object
    createMedicationObject(medString) {
        return {
            name: medString,
            dosage: 'As directed',
            frequency: 'As prescribed',
            duration: 'Until finished'
        };
    }

    // Generate instructions
    generateInstructions(medicalInfo) {
        const instructions = [];
        
        // General instructions
        instructions.push('Take medications as prescribed');
        instructions.push('Complete the full course of medication');
        
        // Symptom-specific instructions
        if (medicalInfo.symptoms.some(s => s.toLowerCase().includes('fever'))) {
            instructions.push('Rest and stay hydrated');
            instructions.push('Monitor temperature regularly');
        }
        
        if (medicalInfo.symptoms.some(s => s.toLowerCase().includes('pain'))) {
            instructions.push('Avoid strenuous activities');
            instructions.push('Apply ice or heat as needed');
        }
        
        if (medicalInfo.allergies.length > 0) {
            instructions.push('Avoid known allergens');
            instructions.push('Carry antihistamines if prescribed');
        }
        
        // Diet and lifestyle
        instructions.push('Maintain a balanced diet');
        instructions.push('Get adequate rest');
        
        return instructions.join('\n');
    }

    // Generate warnings
    generateWarnings(medicalInfo) {
        const warnings = [];
        
        warnings.push('If symptoms worsen or persist, seek immediate medical attention');
        warnings.push('Do not exceed recommended dosage');
        
        if (medicalInfo.allergies.length > 0) {
            warnings.push('Check medication ingredients for allergens');
        }
        
        warnings.push('Keep medications out of reach of children');
        warnings.push('Do not share medications with others');
        
        return warnings;
    }

    // Clean sentence
    cleanSentence(sentence) {
        return sentence.trim().replace(/^[,.\s]+|[,.\s]+$/g, '');
    }

    // Create empty prescription
    createEmptyPrescription() {
        return {
            patientName: 'Patient Name',
            date: new Date().toLocaleDateString(),
            diagnosis: 'No diagnosis recorded',
            symptoms: ['No symptoms recorded'],
            medications: [],
            instructions: 'No instructions recorded',
            followUp: 'Schedule follow-up as needed',
            warnings: ['Consult physician for proper diagnosis'],
            transcript: ''
        };
    }

    // Format prescription for display
    formatPrescriptionHTML(prescription) {
        let html = `
            <h3>Prescription Summary</h3>
            <p><strong>Date:</strong> ${prescription.date}</p>
            <p><strong>Patient:</strong> ${prescription.patientName}</p>
            
            <div class="section">
                <h4>Diagnosis</h4>
                <p>${prescription.diagnosis}</p>
            </div>
            
            <div class="section">
                <h4>Symptoms</h4>
                <ul>
                    ${prescription.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}
                </ul>
            </div>
        `;

        if (prescription.medications.length > 0) {
            html += `
                <div class="section">
                    <h4>Medications</h4>
                    <ul>
                        ${prescription.medications.map(med => `
                            <li>
                                <strong>${med.name}</strong>
                                ${med.dosage ? ` - ${med.dosage}` : ''}
                                ${med.frequency ? ` - ${med.frequency}` : ''}
                                ${med.duration ? ` - ${med.duration}` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        html += `
            <div class="section">
                <h4>Instructions</h4>
                <p>${prescription.instructions.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div class="section">
                <h4>Follow-up</h4>
                <p>${prescription.followUp}</p>
            </div>
            
            <div class="section">
                <h4>Warnings</h4>
                <ul>
                    ${prescription.warnings.map(warning => `<li>${warning}</li>`).join('')}
                </ul>
            </div>
        `;

        return html;
    }
}

// Create global instance
const prescriptionSummarizer = new PrescriptionSummarizer(); 