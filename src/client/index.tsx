import { createRoot } from "react-dom/client";
import { usePartySocket } from "partysocket/react";
import React, { useState, useEffect, useRef } from "react";
import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
	useParams,
} from "react-router";
import { nanoid } from "nanoid";

import { names, type ChatMessage, type Message } from "../shared";

function App() {
	const [enteredName, setEnteredName] = useState<string | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [onlineCount, setOnlineCount] = useState<number>(0);
	const { room } = useParams();
	const lastMessageTime = useRef<number>(0);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	const socket = usePartySocket({
		party: "chat",
		room,
		onOpen: () => {
			console.log("Connected to chat");
		},
		onMessage: (evt) => {
			const message = JSON.parse(evt.data as string) as Message;
			if (message.type === "add") {
				const foundIndex = messages.findIndex((m) => m.id === message.id);
				if (foundIndex === -1) {
					// probably someone else who added a message
					setMessages((messages) => {
						const newMessages = [
							...messages,
							{
								id: message.id,
								content: message.content,
								user: message.user,
								role: message.role,
							},
						];
						// Keep only last 20 messages
						if (newMessages.length > 20) {
							return newMessages.slice(newMessages.length - 20);
						}
						return newMessages;
					});
				} else {
					// this usually means we ourselves added a message
					// and it was broadcasted back
					// so let's replace the message with the new message
					setMessages((messages) => {
						const updated = messages
							.slice(0, foundIndex)
							.concat({
								id: message.id,
								content: message.content,
								user: message.user,
								role: message.role,
							})
							.concat(messages.slice(foundIndex + 1));
						return updated;
					});
				}
			} else if (message.type === "update") {
				setMessages((messages) =>
					messages.map((m) =>
						m.id === message.id
							? {
									id: message.id,
									content: message.content,
									user: message.user,
									role: message.role,
								}
							: m,
					),
				);
			} else if (message.type === "presence") {
				// Handle presence updates
				if (message.count !== undefined) {
					setOnlineCount(message.count);
				}
			} else {
				setMessages(message.messages);
			}
		},
	});

	// Update online count display
	useEffect(() => {
		const countElement = document.getElementById("count");
		if (countElement) {
			countElement.textContent = String(onlineCount);
		}
	}, [onlineCount]);

	// Name entry form
	if (!enteredName) {
		return (
			<div className="name-entry-container">
				<div className="name-entry-box">
					<h3>Welcome to Teleshen Chat</h3>
					<p>Please enter your name to join:</p>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							const nameInput = e.currentTarget.elements.namedItem(
								"name",
							) as HTMLInputElement;
							if (nameInput.value.trim()) {
								setEnteredName(nameInput.value.trim());
							}
						}}
					>
						<input
							type="text"
							name="name"
							className="u-full-width"
							placeholder="Enter your name..."
							autoComplete="off"
							autoFocus
						/>
						<button type="submit" className="button-primary u-full-width">
							Join Chat
						</button>
					</form>
				</div>
			</div>
		);
	}

	return (
		<div className="chat-container" ref={chatContainerRef}>
			<div className="messages-wrapper">
				<div className="messages-gradient-top"></div>
				{messages.map((message) => (
					<div key={message.id} className="message-row">
						<div className="message-avatar">{message.user.charAt(0).toUpperCase()}</div>
						<div className="message-content">
							<div className="message-user">{message.user}</div>
							<div className="message-text">{message.content}</div>
						</div>
					</div>
				))}
				<div className="messages-gradient-bottom"></div>
			</div>
			<form
				className="message-form"
				onSubmit={(e) => {
					e.preventDefault();
					const now = Date.now();
					const timeSinceLastMessage = now - lastMessageTime.current;
					
					// Enforce 5 second delay between messages
					if (timeSinceLastMessage < 5000 && lastMessageTime.current !== 0) {
						alert(`Please wait ${Math.ceil((5000 - timeSinceLastMessage) / 1000)} seconds before sending another message.`);
						return;
					}
					
					const content = e.currentTarget.elements.namedItem(
						"content",
					) as HTMLInputElement;
					
					if (!content.value.trim()) {
						return;
					}
					
					const chatMessage: ChatMessage = {
						id: nanoid(8),
						content: content.value.trim(),
						user: enteredName,
						role: "user",
					};
					setMessages((messages) => {
						const newMessages = [...messages, chatMessage];
						if (newMessages.length > 20) {
							return newMessages.slice(newMessages.length - 20);
						}
						return newMessages;
					});
					lastMessageTime.current = now;

					socket.send(
						JSON.stringify({
							type: "add",
							...chatMessage,
						} satisfies Message),
					);

					content.value = "";
				}}
			>
				<input
					type="text"
					name="content"
					className="message-input"
					placeholder={`Type a message as ${enteredName}...`}
					autoComplete="off"
				/>
				<button type="submit" className="send-button">
					Send
				</button>
			</form>
		</div>
	);
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<Navigate to={`/${nanoid()}`} />} />
			<Route path="/:room" element={<App />} />
			<Route path="*" element={<Navigate to="/" />} />
		</Routes>
	</BrowserRouter>,
);
