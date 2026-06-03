import { Component } from '@angular/core';
import { RecruitmentService } from '../../core/services/recruitment.service';
import { AuthService } from '../../core/services/auth.service';

interface ChatMessage { role: 'user' | 'ai'; text: string; category?: string; }

@Component({ selector: 'app-ai-chatbot', templateUrl: './ai-chatbot.component.html', standalone: false })
export class AIChatbotComponent {
  isOpen = false;
  messages: ChatMessage[] = [];
  inputText = '';
  loading = false;

  suggestions = [
    'How many annual leaves do I get?',
    'What is the work from home policy?',
    'What is the notice period?',
    'How does salary disbursement work?'
  ];

  constructor(private recruitment: RecruitmentService, private auth: AuthService) {}

  toggle() { this.isOpen = !this.isOpen; }

  send(text?: string) {
    const q = text || this.inputText.trim();
    if (!q) return;

    this.messages.push({ role: 'user', text: q });
    this.inputText = '';
    this.loading = true;

    const user = this.auth.getCurrentUser();
    this.recruitment.askChatbot({
      question: q,
      employee_name: user?.fullName || 'Employee',
      department: user?.department || 'General'
    }).subscribe({
      next: r => { this.messages.push({ role: 'ai', text: r.answer, category: r.category }); this.loading = false; },
      error: () => { this.messages.push({ role: 'ai', text: 'Sorry, I could not process your question. Please try again.' }); this.loading = false; }
    });
  }

  onKey(e: KeyboardEvent) { if (e.key === 'Enter') this.send(); }
}
