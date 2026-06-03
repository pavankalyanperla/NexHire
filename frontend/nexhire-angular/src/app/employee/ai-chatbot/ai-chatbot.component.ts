import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

interface ChatMessage { role: 'user' | 'ai'; text: string; category?: string; }

@Component({ selector: 'app-ai-chatbot', templateUrl: './ai-chatbot.component.html', standalone: false })
export class AIChatbotComponent {
  isOpen = false;
  messages: ChatMessage[] = [];
  inputText = '';
  loading = false;
  isListening = false;
  toastMsg = '';
  toastSev = '';
  showToastMsg = false;

  private chatbotUrl = 'http://localhost:8002/api/interview/chatbot';

  suggestions = [
    'How many annual leaves do I get?',
    'What is the work from home policy?',
    'What is the notice period?',
    'How does salary disbursement work?'
  ];

  constructor(private http: HttpClient, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  toggle() { this.isOpen = !this.isOpen; }

  send(text?: string) {
    const q = (text || this.inputText).trim();
    if (!q || this.loading) return;

    this.messages.push({ role: 'user', text: q });
    this.inputText = '';
    this.loading = true;
    this.cdr.detectChanges();

    const user = this.auth.getCurrentUser();
    this.http.post<{ answer: string; category: string }>(this.chatbotUrl, {
      question: q,
      employee_name: user?.fullName || 'Employee',
      department: user?.department || 'General'
    }).subscribe({
      next: r => {
        this.messages.push({ role: 'ai', text: r.answer, category: r.category });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messages.push({ role: 'ai', text: 'Sorry, the AI assistant is temporarily unavailable. Please try again.' });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onKey(e: KeyboardEvent) { if (e.key === 'Enter') this.send(); }

  startVoiceInput() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.showToast('Voice input not supported. Use Chrome.', 'warn');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    this.isListening = true;
    this.cdr.detectChanges();
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.inputText = transcript;
      this.isListening = false;
      this.cdr.detectChanges();
      this.send();
    };

    recognition.onerror = () => {
      this.isListening = false;
      this.showToast('Voice input error. Please try again.', 'error');
    };

    recognition.onend = () => { this.isListening = false; this.cdr.detectChanges(); };
  }

  showToast(msg: string, sev: string) {
    this.toastMsg = msg;
    this.toastSev = sev;
    this.showToastMsg = true;
    setTimeout(() => { this.showToastMsg = false; this.cdr.detectChanges(); }, 3000);
  }
}
