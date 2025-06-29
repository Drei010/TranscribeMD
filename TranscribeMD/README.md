# TranscribeMD

A web-based application that records doctor-patient conversations, provides real-time transcription, and automatically generates prescription summaries.

## Features

- 🎤 **Audio Recording**: Record conversations with start, stop, and pause controls
- 📝 **Real-time Transcription**: Live speech-to-text conversion during recording
- 💊 **Prescription Generation**: Automatic extraction and summarization of medical information
- 💾 **Local Storage**: Save prescriptions locally with patient privacy in mind
- 🖨️ **Print Support**: Print-friendly prescription format
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Quick Start

1. Download or clone this repository
2. Open `index.html` in a modern web browser
3. Allow microphone access when prompted
4. Start recording your conversation!

## How to Use

### Recording a Conversation

1. Click the **"Start Recording"** button
2. Grant microphone permission if prompted
3. Begin speaking - you'll see real-time transcription appear
4. Use **"Pause"** if you need to temporarily stop
5. Click **"Stop Recording"** when finished

### Understanding the Prescription

The application automatically extracts:
- Patient name (if mentioned)
- Symptoms and complaints
- Medications with dosages
- Diagnosis information
- Follow-up instructions

### Saving and Managing Prescriptions

- Click **"Save Prescription"** to store locally
- Enter patient name when prompted
- View saved prescriptions in the "Recent Prescriptions" section
- Click any saved prescription to view details

## Example Conversation

Try saying something like:

> "The patient's name is John Smith. He is complaining of severe headaches and fever for the past three days. 
> Blood pressure is 120/80. Temperature is 101 degrees Fahrenheit. 
> My diagnosis is viral infection with secondary sinusitis. 
> I'm prescribing Ibuprofen 400mg twice a day for 5 days and Amoxicillin 500mg three times a day for 7 days. 
> The patient should rest, stay hydrated, and follow up in one week if symptoms don't improve."

## Browser Compatibility

| Browser | Recording | Transcription | Overall Support |
|---------|-----------|---------------|-----------------|
| Chrome  | ✅ | ✅ | Excellent |
| Edge    | ✅ | ✅ | Excellent |
| Safari  | ✅ | ✅ | Good |
| Firefox | ✅ | ❌ | Limited |

**Note**: For best results, use Chrome or Edge browsers.

## Privacy & Security

- ✅ **No Server Communication**: All processing happens in your browser
- ✅ **Local Storage Only**: Data never leaves your device
- ✅ **No External APIs**: Uses built-in browser capabilities
- ✅ **HIPAA Friendly**: Designed with patient privacy in mind

## Technical Details

Built with:
- Pure HTML5, CSS3, and JavaScript (ES6+)
- Web Audio API for recording
- Web Speech API for transcription
- LocalStorage API for data persistence
- No external dependencies or npm packages

## Troubleshooting

### Microphone Access Denied
- Check browser permissions in settings
- Ensure no other application is using the microphone
- Try refreshing the page

### No Transcription Appearing
- Verify you're using a supported browser
- Check your internet connection (required for speech recognition)
- Speak clearly and close to the microphone

### Prescription Not Generating
- Ensure the recording captured speech
- Include medical keywords in your conversation
- Check the transcription for accuracy

## Limitations

- Speech recognition requires internet connection
- Transcription accuracy depends on audio quality
- Medical term recognition is keyword-based
- Storage is limited to browser's local storage capacity

## Future Enhancements

- PDF export functionality
- Multi-language support
- Advanced medical terminology recognition
- Cloud backup options
- Integration with EHR systems

## License

This project is provided as-is for educational and demonstration purposes.

## Support

For issues or questions, please check the browser console for error messages and ensure you're using a compatible browser with microphone permissions enabled. 