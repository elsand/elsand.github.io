---
---
```jsonc
// Input modell som tjenesteeiere oppgir for å opprette en ny varsling som følge av en dialog.

// POST /dialogporten/api/v1/dialogs/{dialogId}/notifications
{
    "sms": {
            "text": [ { "code": "nb_NO", "value": "dette kommer på sms" } ],
            
            // Hvis avsender-felt skal være noe annet enn navn på tjenesteeier kan dette oppgis her. 
            // Valideres opp mot whitelist knyttet til autentisert org.
            "from": [ { "code": "nb_NO", "value": "Etaten" } ]
    },
    "email": {
            "subject": [ { "code": "nb_NO", "value": "emnefeltet på e-post" } ],
            //
            "template": "some-email-template",
            "tokens": [
                { "name": "header", "value": [ { "code": "nb_NO", "value": "dette er en header" } ] },
                { "name": "body", "value": [ { "code": "nb_NO", "value": "Hei {{party.fullname}}!" } ] } 
            ]
    },
    "push": {
        // Basert på https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
        "title": [ { "code": "nb_NO", "value": "Tittel på notifikasjon" } ],
        "body": [ { "code": "nb_NO", 
            "value": "Dette er første linje\nDette er andre linje, sendt til {{party.fullname}}" } ],
        "icon": "https://example.com/some-icon-atleast-192x192.png",
        // Valgfri URL som bruker blir sendt til hvis notifikasjonen klikkes på. Blir utvidet med sesjonstoken.
        "notificationClickUrl": "https://example.com/some/deep/link/to/dialogues/123456789"
    }
}