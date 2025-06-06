"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, X, Bot } from "lucide-react";
// @ts-ignore
import anime from 'animejs';

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const welcomeMessage: Message = {
    role: "assistant",
    content: "Здравствуйте! Я ваш персональный ассистент автодилерского центра. Чем я могу вам помочь? Вы хотите купить или продать автомобиль?"
  };

  // Анимация при открытии диалога
  useEffect(() => {
    if (isOpen && cardRef.current) {
      anime({
        targets: cardRef.current,
        scale: [0, 1],
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 500,
        easing: 'easeOutElastic(1, .8)'
      });
    }
  }, [isOpen]);

  // Анимация пульсации кнопки
  useEffect(() => {
    if (!isOpen && buttonRef.current) {
      const animation = anime({
        targets: buttonRef.current,
        scale: [1, 1.1, 1],
        boxShadow: [
          '0 0 0 rgba(var(--primary), 0.3)',
          '0 0 15px rgba(var(--primary), 0.6)',
          '0 0 0 rgba(var(--primary), 0.3)'
        ],
        duration: 2000,
        easing: 'easeInOutQuad',
        loop: true
      });

      return () => {
        animation.pause();
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

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: 'автодилерский_центр', // Указываем контекст для использования базы знаний
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message }
      ]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Извините, произошла ошибка. Попробуйте позже или обратитесь в нашу службу поддержки." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          ref={buttonRef}
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </Button>
      ) : (
        <div ref={cardRef} className="origin-bottom-right">
          <Card className="w-80 sm:w-96 shadow-xl border-primary/20 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-semibold">Автодилерский Центр</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full h-8 w-8 hover:bg-primary/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
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