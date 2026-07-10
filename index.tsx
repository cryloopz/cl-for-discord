/*
 * Plugin cl - Apaga suas mensagens com um clique
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import definePlugin from "@utils/types";
import { UserStore, Toasts, SelectedChannelStore, FluxDispatcher, Menu } from "@webpack/common";
import { Logger } from "@utils/Logger";

const logger = new Logger("cl");

let cachedToken: string | null = null;

function setToken(token: string) {
    if (token && token.length > 20) {
        cachedToken = token;
        (window as any).__DISCORD_TOKEN__ = token;
        Toasts.show({
            message: "✅ Token definido!",
            id: Toasts.genId(),
            type: Toasts.Type.SUCCESS
        });
    }
}

function getToken(): string | null {
    return cachedToken || (window as any).__DISCORD_TOKEN__ || null;
}

async function deleteMyMessages(channelId: string) {
    const token = getToken();
    if (!token) {
        Toasts.show({
            message: "❌ Use: cl.setToken('SEU_TOKEN') no console",
            id: Toasts.genId(),
            type: Toasts.Type.FAILURE
        });
        return;
    }

    let lastMessageId: string | null = null;
    let totalDeleted = 0;
    const userId = UserStore.getCurrentUser().id;

    Toasts.show({
        message: "🧹 Apagando...",
        id: Toasts.genId(),
        type: Toasts.Type.INFO
    });

    while (true) {
        try {
            const url = `/api/v9/channels/${channelId}/messages?limit=100${lastMessageId ? `&before=${lastMessageId}` : ""}`;
            const response = await fetch(url, {
                headers: { "Authorization": token }
            });

            if (!response.ok) break;

            const messages = await response.json();
            if (!messages || messages.length === 0) break;

            const myMessages = messages.filter((msg: any) => msg.author.id === userId);

            for (const msg of myMessages) {
                try {
                    const del = await fetch(`/api/v9/channels/${channelId}/messages/${msg.id}`, {
                        method: "DELETE",
                        headers: { "Authorization": token }
                    });
                    if (del.ok) totalDeleted++;
                    await new Promise(r => setTimeout(r, 150));
                } catch (e) {}
            }

            if (totalDeleted % 50 === 0 && totalDeleted > 0) {
                Toasts.show({
                    message: `🧹 ${totalDeleted} mensagens apagadas`,
                    id: Toasts.genId(),
                    type: Toasts.Type.INFO
                });
            }

            if (messages.length < 100) break;
            lastMessageId = messages[messages.length - 1].id;
            await new Promise(r => setTimeout(r, 200));
        } catch (e) {
            break;
        }
    }

    Toasts.show({
        message: `✅ ${totalDeleted} mensagens apagadas!`,
        id: Toasts.genId(),
        type: Toasts.Type.SUCCESS
    });
}

function runCleanup() {
    const channelId = SelectedChannelStore.getChannelId();
    if (!channelId) {
        Toasts.show({
            message: "❌ Canal não encontrado",
            id: Toasts.genId(),
            type: Toasts.Type.FAILURE
        });
        return;
    }
    deleteMyMessages(channelId);
}

const UserContext: NavContextMenuPatchCallback = (children, { user }) => {
    if (!user) return;
    if (user.id !== UserStore.getCurrentUser().id) return;

    const channelId = SelectedChannelStore.getChannelId();
    if (!channelId) return;

    children.splice(-1, 0, (
        <Menu.MenuGroup>
            <Menu.MenuItem
                id="cl"
                label="cl - Apagar minhas mensagens"
                action={() => deleteMyMessages(channelId)}
            />
        </Menu.MenuGroup>
    ));
};

export default definePlugin({
    name: "cl",
    description: "Apaga suas mensagens do chat atual",
    authors: [{ name: "l1wn", id: 0n }],

    contextMenus: {
        "user-context": UserContext
    },

    flux: {
        MESSAGE_CREATE({ message }) {
            if (!message) return;
            if (message.author.id !== UserStore.getCurrentUser().id) return;
            if (message.content?.trim() !== "cl") return;

            FluxDispatcher.dispatch({
                type: "MESSAGE_DELETE",
                channelId: message.channel_id,
                messageId: message.id
            });

            deleteMyMessages(message.channel_id);
        }
    },

    start() {
        (window as any).cl = {
            run: runCleanup,
            setToken: setToken,
            check: () => {
                const token = getToken();
                Toasts.show({
                    message: token ? "✅ Token definido" : "❌ Token não definido",
                    id: Toasts.genId(),
                    type: token ? Toasts.Type.SUCCESS : Toasts.Type.FAILURE
                });
                return token;
            }
        };

        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === "C") {
                e.preventDefault();
                runCleanup();
            }
        };
        document.addEventListener("keydown", handler);
        (window as any).__clHandler = handler;

        logger.info("✅ Plugin cl iniciado!");
        logger.info("📌 Clique direito em você mesmo > cl - Apagar minhas mensagens");
        logger.info("📌 Ctrl+Shift+C para limpar");
        logger.info("📌 Digite 'cl' no chat");
        logger.info("📌 Token: cl.setToken('SEU_TOKEN')");
    },

    stop() {
        if ((window as any).__clHandler) {
            document.removeEventListener("keydown", (window as any).__clHandler);
        }
        delete (window as any).cl;
        logger.info("❌ Plugin cl desativado!");
    }
});