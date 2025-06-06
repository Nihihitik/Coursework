"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageCircle,
  Send,
  X,
  Bot,
  RotateCcw,
  Settings,
  Clock,
  Star
} from "lucide-react";
import { animate } from 'animejs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

const QUICK_QUESTIONS = [
  { text: "Как найти автомобиль по параметрам?", value: "Как найти автомобиль по конкретным параметрам?" },
  { text: "Как зарегистрироваться?", value: "Как зарегистрироваться на платформе?" },
  { text: "Как продать свой автомобиль?", value: "Как я могу продать свой автомобиль через ваш сервис?" },
  { text: "Как связаться с продавцом?", value: "Как я могу связаться с продавцом автомобиля?" },
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedChats, setSavedChats] = useState<Array<{title: string, messages: Message[]}>>([]);
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const welcomeMessage: Message = {
    role: "assistant",
    content: "Здравствуйте! Я ваш персональный ассистент автодилерского центра. Чем я могу вам помочь? Вы хотите купить или продать автомобиль?",
    timestamp: new Date()
  };

  // Анимация при открытии диалога - более быстрая
  useEffect(() => {
    if (isOpen && cardRef.current) {
      animate(cardRef.current, {
        scale: [0, 1],
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 300, // Сократили с 500 до 300 мс
        easing: 'easeOutQuad' // Более быстрая easing функция
      });
    }
  }, [isOpen]);

  // Анимация пульсации кнопки
  useEffect(() => {
    if (!isOpen && buttonRef.current) {
      const animation = animate(buttonRef.current, {
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 0 rgba(var(--primary), 0.3)',
          '0 0 15px rgba(var(--primary), 0.6)',
          '0 0 0 rgba(var(--primary), 0.3)'
        ],
        duration: 1500, // Более быстрая анимация
        easing: 'easeInOutQuad',
        loop: true
      });

      return () => {
        if (animation && typeof animation.pause === 'function') {
          animation.pause();
        }
      };
    }
  }, [isOpen]);

  // Сброс сообщений и добавление приветственного сообщения при открытии
  useEffect(() => {
    if (isOpen) {
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  // Прокрутка к последнему сообщению
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowQuickQuestions(false);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: 'автодилерский_центр',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Извините, произошла ошибка. Попробуйте позже или обратитесь в нашу службу поддержки.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestionClick = (question: string) => {
    setInput(question);
    setShowQuickQuestions(false);
  };

  const clearChat = () => {
    setMessages([welcomeMessage]);
  };

  const saveCurrentChat = () => {
    if (messages.length <= 1) return; // Не сохраняем пустые чаты

    const chatTitle = messages.length > 1
      ? messages[1].content.slice(0, 30) + "..."
      : "Сохраненный чат";

    setSavedChats(prev => [
      ...prev,
      {
        title: chatTitle,
        messages: [...messages]
      }
    ]);
  };

  const loadChat = (index: number) => {
    if (savedChats[index]) {
      setMessages(savedChats[index].messages);
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('ru', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          ref={buttonRef}
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300"
          onClick={() => setIsOpen(true)}
          title="Задайте вопрос ассистенту"
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </Button>
      ) : (
        <div ref={cardRef} className="origin-bottom-right">
          <Card className="w-[350px] sm:w-[420px] shadow-xl border-primary/20 rounded-xl overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center justify-end space-y-0">
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                className="rounded-md"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[350px] px-4">
                <div className="py-4 space-y-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-4 py-2 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                            : "bg-muted text-foreground rounded-tl-none shadow-sm"
                        }`}
                      >
                        {msg.content}
                        {msg.timestamp && (
                          <div className={`text-xs mt-1 ${
                            msg.role === "user"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}>
                            {formatTime(msg.timestamp)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-xl px-4 py-3 bg-muted text-foreground rounded-tl-none shadow-sm">
                        <div className="flex space-x-2 items-center">
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {showQuickQuestions && (
                    <div className="bg-muted/30 rounded-lg p-3 mt-4 border border-border">
                      <h3 className="text-sm font-medium mb-3">Часто задаваемые вопросы:</h3>
                      <div className="space-y-2">
                        {QUICK_QUESTIONS.map((question, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="w-full justify-start text-left h-auto py-2 px-3 text-sm"
                            onClick={() => handleQuickQuestionClick(question.value)}
                          >
                            <span className="mr-2 text-xs bg-primary/10 px-2 py-0.5 rounded-full">{index + 1}</span> {question.text}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            <CardFooter className="p-3 border-t">
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Напишите сообщение..."
                  disabled={isLoading}
                  className="flex-1 bg-muted/50 focus-visible:ring-primary"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading}
                  className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}