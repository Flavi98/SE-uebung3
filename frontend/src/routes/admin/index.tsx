import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';

export default component$(() => {
    const username = useSignal<string | null>('');
    const isAdmin = useSignal<number | null>();
    const data = useSignal<any[]>([]);
    const open = useSignal(false);
    const nav = useNavigate();
    const eventname = useSignal('');
    const updateOpen = useSignal(false);
    const selectedEvent = useSignal<string | undefined>('');
    const updateEventName = useSignal('');

    //Funktion für Laden der Daten aus der Datenbank
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

    //Schauen welcher User angemeldet ist mit der gespeicherten Session Storage
    useVisibleTask$(async () => {
        username.value = sessionStorage && sessionStorage.getItem("username");
        isAdmin.value = sessionStorage && JSON.parse(sessionStorage.getItem("isAdmin") || '0');

        if (isAdmin.value === 0 && !username.value) {
            nav('/');
        } else if (isAdmin.value === 0 && username.value) {
            nav('/persons');
        }

        loadData();
    });

    //Löschen eines Events
    const deleteEvent = $((eventId: string) => {
        fetch(`http://localhost:8000/deleteevent/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Event deleted successfully:', data);
                loadData();
            })
            .catch(error => {
                console.error('Error deleting event:', error);
            });
    });

    const logout = $(() => {
        sessionStorage.clear();
        nav('/');
    })

    const openCreate = $(() => {
        open.value = true;
    })

    const handleClose = $(() => {
        open.value = false;
        updateOpen.value = false;
    })

    //Erstellen eines Events
    const createEvent = $(() => {
        const apiUrl = "http://localhost:8000/addNewEvent";
        fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                event: eventname.value,
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

        handleClose();
    })

    const updateEventOpen = $((item: string) => {
        updateOpen.value = true;
        selectedEvent.value = item;
    })

    //Name eines Events ändern
    const updateEvent = $(() => {
        const apiUrl = "http://localhost:8000/updateEvent";
        fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                event: selectedEvent.value,
                updateEvent: updateEventName.value
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

        handleClose();
    })

    return (
        <>
            <div>
                <button class="logout-button" onClick$={() => logout()}>Ausloggen</button>
                <h1>Willkommen {username}</h1>
                <h1>Veranstaltungen</h1>
                <div class="admin-container">
                    <div>
                        <list>
                            {data.value.map((item: any) => (
                                <ul key={item.id}>
                                    <li>
                                        <p>{item.eventname}</p>
                                        <button style={{ marginRight: 24 }} onClick$={() => deleteEvent(item.id)}>Löschen</button>
                                        <button onClick$={() => updateEventOpen(item.eventname)}>Bearbeiten</button>
                                    </li>
                                </ul>
                            ))}
                        </list>
                        <button style={{ margin: '48px 24px 24px 28px' }} onClick$={() => openCreate()}>Veranstaltung erstellen</button>
                    </div>
                    <div class="dialog-container">
                        <dialog
                            open={open.value}
                            onClose$={() => handleClose()}>
                            <dialogTitle>
                                <p>Veranstaltung erstellen</p>
                            </dialogTitle>
                            <dialogContent>
                                <dialogContentText>
                                    <box>
                                        <p>Name: <input bind:value={eventname} type="text" id="eventname" name="eventname"></input></p>
                                    </box>
                                </dialogContentText>
                            </dialogContent>
                            <dialogActions>
                                <button style={{ marginRight: 24 }} onClick$={() => handleClose()}>Schließen</button>
                                <button onClick$={() => createEvent()}>Erstellen</button>
                            </dialogActions>
                        </dialog>
                        <dialog
                            open={updateOpen.value}
                            onClose$={() => handleClose()}>
                            <dialogTitle>
                                <p>Veranstaltung bearbeiten</p>
                            </dialogTitle>
                            <dialogContent>
                                <dialogContentText>
                                    <box>
                                        <p>Name: <input bind:value={updateEventName} type="text" id="eventname" name="eventname" value={selectedEvent.value}></input></p>
                                    </box>
                                </dialogContentText>
                            </dialogContent>
                            <dialogActions>
                                <button style={{ marginRight: 24 }} onClick$={() => handleClose()}>Schließen</button>
                                <button onClick$={() => updateEvent()}>Bearbeiten</button>
                            </dialogActions>
                        </dialog>
                    </div>
                </div>
            </div>
        </>
    );
});