
self.addEventListener("push", (event) => {
    let data = {
        title: "EC WhatsApp Inbox",
        body: "Aapko naya WhatsApp message mila hai.",
        url: "/admin/whatsapp/inbox",
    };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch {
            data.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: "/icon-192.png",
            data: {
                url: data.url || "/admin/whatsapp/inbox",
            },
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    event.waitUntil(
        self.clients.openWindow(
            event.notification.data?.url || "/admin/whatsapp/inbox"
        )
    );
});
