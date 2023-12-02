import { $, component$, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';

export default component$(() => {
    const username = useSignal<string | null>('');
    const data = useSignal<any[]>([]);
    // const userevent = { user: $(String), event: $(String), id: $(String) };
    const user = useSignal<string>();
    const event = useSignal<string>();
    const id = useSignal<string>();

    const nav = useNavigate();

    //Daten von DB laden
    const loadData = $(() => {
        fetch('http://localhost:8000/events')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                data.value = result;
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    })

    useVisibleTask$(async () => {
        console.log(localStorage && sessionStorage.getItem("username"));
        username.value = localStorage && sessionStorage.getItem("username");

        if (!username.value) {
            nav('/');
        }
        loadData();
    });

    //Funktion für anmelden einer Veranstaltung
    const registerEvent = $((id: string, event: string) => {
        const apiUrl = "http://localhost:8000/addevents";
        fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user: username.value,
                id: id,
                event: event,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Event added successfully:", data);
                loadData();
            })
            .catch((error) => {
                console.error("Error adding event:", error);
            });
    });

    //Funktion für Abmeldung einer Veranstaltung
    const unregisterEvent = $((id: string, event: string) => {
        const apiUrl = "http://localhost:8000/deleteuser";
        fetch(apiUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user: username.value,
                id: id,
                event: event,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Event unregistered successfully:", data);
                loadData();
            })
            .catch((error) => {
                console.error("Error unregistering event:", error);
            });
    });

    const logout = $(() => {
        sessionStorage.clear();
        nav('/');
    })


    return (
        <div>
            <div class="title">
                <h1>Hallo, {username.value}</h1>
                <button class="logout-button" onClick$={() => logout()}>Ausloggen</button>
            </div>
            <h2>Angemeldete Veranstaltungen</h2>
            <list>
                {data.value.filter(event => event.users.includes(username.value)).map((item) => (
                    <ul key={item.id}>
                        <li>
                            <p>{item.eventname}</p>
                            <button onClick$={() => unregisterEvent(item.id, item.eventname)}>Abmelden</button>
                        </li>
                    </ul>
                ))}
            </list>
            <h2>Nicht Angemeldete Veranstaltungen</h2>
            <list>
                {data.value.filter(event => !event.users.includes(username.value)).map((item) => (
                    <ul key={item.id}>
                        <li>
                            <p>{item.eventname}</p>
                            <button onClick$={() => registerEvent(item.id, item.eventname)}>Anmelden</button>
                        </li>
                    </ul>
                ))}
            </list>
        </div>
    );
});

