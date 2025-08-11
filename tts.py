from win32com.client import constants
import win32com.client
import pythoncom
import time

class SpeechRecognition:
    def __init__(self):
        # For text-to-speech (optional, for feedback)
        self.speaker = win32com.client.Dispatch("SAPI.SpVoice")
        # For speech recognition - use in-process recognizer to avoid global UI/control
        self.listener = win32com.client.Dispatch("SAPI.SpInprocRecognizer")
        # Use default microphone via a multimedia audio input stream
        try:
            self.listener.AudioInputStream = win32com.client.Dispatch("SAPI.SpMMAudioIn")
        except Exception:
            pass  # fall back to default device
        # Create a recognition context
        self.context = self.listener.CreateRecoContext()
        # Rely on default event interests; OnRecognition will fire without explicit mask
        # Create an associated grammar
        self.grammar = self.context.CreateGrammar()
        # Load and enable dictation mode (free-form recognition)
        self.grammar.DictationLoad()
        # 1 == SGDSActive; using literal to avoid missing constants in some environments
        self.grammar.DictationSetState(1)
        # Add event handler for recognition events
        self.event_handler = win32com.client.WithEvents(self.context, ContextEvents)
        # Announce start (using TTS)
        self.say("Started successfully. Speak now...")

    def say(self, phrase):
        self.speaker.Speak(phrase)

class ContextEvents:
    def OnRecognition(self, StreamNumber, StreamPosition, RecognitionType, Result):
        newResult = win32com.client.Dispatch(Result)
        print("You said:", newResult.PhraseInfo.GetText())

if __name__ == '__main__':
    # Initialize COM for this thread
    pythoncom.CoInitialize()
    try:
        speechReco = SpeechRecognition()
        while True:
            pythoncom.PumpWaitingMessages()
            time.sleep(0.05)
    finally:
        pythoncom.CoUninitialize()
        