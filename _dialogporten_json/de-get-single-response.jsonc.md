---
---
```jsonc
// Modellene er hovedsaklig like for SBS og tjenesteier, med unntak:
// - "configuration" vises kun til tjenesteeier


// GET /dialogporten/api/v1/de/e0300961-85fb-4ef2-abff-681d77f9960e
{
    "id": "e0300961-85fb-4ef2-abff-681d77f9960e",
    "serviceResourceIdentifier": "example_dialogue_service", // Her kan det være en lenke 
    "externalReference": "123456789",
    "dialogueGroup": {
        "id": "some-arbitrary-id",
        "order": 1,
        "name": [ { "code": "nb_NO", "value": "Navn på dialoggruppe." } ]
    },
    "party": "org:991825827",
    "status": "under-progress", 
    "dates": {
        "createdDateTime": "2022-12-01T10:00:00.000Z",
        "updatedDateTime": "2022-12-01T10:00:00.000Z",
        // Sist meldingen ble "lest", altså ekspandert i UI eller hentet via detailsUrl i API. Hvis ikke oppgitt, eller 
        // readDateTime < updatedDateTime vises typisk elementet som ulest/oppdatert i GUI.
        "readDateTime": "2022-12-01T10:00:00.000Z", 
        "dueDateTime": "2022-12-01T12:00:00.000Z"
    },
    "content": {
        "body": [ { "code": "nb_NO", 
            "value": "Innhold med <em>begrenset</em> HTML-støtte. Dette innholdet vises når elementet ekspanderes." } ],
        "title": [ { "code": "nb_NO", "value": "En eksempel på en tittel" } ],
        "senderName": [ { "code": "nb_NO", "value": "Overstyrt avsendernavn (bruker default tjenesteeiers navn)" } ]            
    },
    // Dialogelementtoken som benyttes mot tjenestetilbyders endepunkter, enten som en HTTP header eller via query parameter
    "dialogElementToken": "eyJhbGciOiJFZERTQSIsImtpZCI6ImRwLTIwMjMtMDEiLCJ0eXAiOiJKV1QifQ.eyJjIjoicGVyc29uOjEyMDE4MjEyMzQ1IiwibCI6NCwicCI6Im9yZzo5OTE4MjU4MjciLCJpIjoiZTAzMDA5NjEtODVmYi00ZWYyLWFiZmYtNjgxZDc3Zjk5NjBlIiwiZSI6IjEyMzQ1Njc4OSIsImEiOlsib3BlbiIsImF0dGFjaG1lbnQxOm9wZW4iLCJjb25maXJtIl0sImV4cCI6MTY3Mjc3Mjg1NywiaXNzIjoiaHR0cHM6Ly9ka
WFsb2dwb3J0ZW4ubm8iLCJuYmYiOjE2NzI3NzI1NTcsImlhdCI6MTY3Mjc3MjU1N30.UXvmH4L6NATJ8ZNWDIfWcf7-BO2c4eQQ3HK0RRmFhzkE5SSc6oV4hxCnsR2MAePLEdDSeCdP6yr5xlJ9Rzt_Dg",
    "attachments": [
        {
            "displayName": [ { "code": "nb_NO", "value": "dette er et vedlegg" } ],
            "sizeInBytes": 123456,
            "contentType": "application/pdf",
            "url": "https://example.com/api/dialogues/123456789/attachments/1",
            "resource": "attachment1"
        }
    ],
    "actions": {
        "gui": [ 
            { 
                "action": "open", // Denne kan refereres i XACML-policy
                "type": "primary", // Dette bestemmer hvordan handlingen presenteres.
                "title": [ { "code": "nb_NO", "value": "Åpne i dialogtjeneste" } ],
                "url": "https://example.com/some/deep/link/to/dialogues/123456789"
            },
            {
                "action": "confirm",
                "resource": "somesubresource", 
                "type": "secondary",
                "title": [ { "code": "nb_NO", "value": "Bekreft mottatt" } ],
                "isBackChannel": true,
                "url": "https://example.com/some/deep/link/to/dialogues/123456789/confirmReceived"
            },
            { 
                "action": "delete",
                "type": "tertiary",
                "title": [ { "code": "nb_NO", "value": "Avbryt" } ],
                "isDeleteAction": true,
                "url": "https://example.com/some/deep/link/to/dialogues/123456789"
            }
        ],
        "api": [ 
            { 
                "action": "open",
                "actionUrl": "https://example.com/api/dialogues/123456789",
                "method": "GET",
                "responseSchema": "https://schemas.altinn.no/de/v1/de.json",
                "documentationUrl": "https://api-docs.example.com/dialogueservice/open-action"
            },
            { 
                "action": "confirm",
                "method": "POST",
                "actionUrl": "https://example.com/api/dialogues/123456789/confirmReceived",
                "documentationUrl": "https://api-docs.example.com/dialogueservice/confirm-action"
            },
            { 
                "action": "submit", 
                "actionUrl": "https://example.com/api/dialogues/123456789",
                "method": "POST",
                "requestSchema": "https://schemas.example.com/dialogueservice/v1/dialogueservice.json",
                "responseSchema": "https://schemas.altinn.no/de/v1/de.json" 
            },
            { 
                "action": "delete",
                "method": "DELETE",
                "actionUrl": "https://example.com/api/dialogues/123456789" 
            }
        ]
    },
    // Dette er ulike innstillinger som kun kan oppgis og er synlig for tjenesteeier. Se de-create-request for informasjon om feltene.
    "configuration": {        
        "requireReadNotification": true,
        "delayCreatedForPartyUntilFirstUpdate": true,
        "visibleDateTime": "2022-12-01T12:00:00.000Z",
        "authorization": {
            "requirePermitFrom": "Both",  
            "xacmlPolicy": [
                {
                    "Effect": "Permit",
                    "Subjects": [
                        "person:12345678901"
                    ],
                    "Resources": [
                        "serviceresource:example_dialogue_service",
                        "serviceresource:example_dialogue_service/attachment1",
                    ],
                    "Actions": [
                        "open",
                        "confirm",
                        "submit",
                        "delete"
                    ],
                    "Description": "Nærmeste leder har alle tilganger",
                    "IsDelegable": true
                },
                {
                    "Effect": "Permit",
                    "Subjects": [
                        "person:23456789012",
                        "accessgroup:taushetsbelagt"
                    ],
                    "Resources": [
                        "serviceresource:example_dialogue_service",
                    ],
                    "Actions": [
                        "open"
                    ],
                    "Description": "Den aktuelle ansatte, samt bemyndigede medarbeidere, har kun lesetilgang",
                    "IsDelegable": false
                }
            ]
        }
    },
    // Skilles ut i egen modell / endepunkt
    // Slå sammen med activitylog? 
    "notificationLog": {
        "sms": [
            { 
                "sentDateTime": "2022-12-01T10:00:00.000Z",
                "status": "pending",
                "notification": {
                    "text": "dette kommer på sms",
                    "from": "Etaten" 
               }
            }
        ],
        "email": [
            {
                "sentDateTime": "2022-12-01T10:00:00.000Z",
                "status": "ok",
                "notification": {
                    "subject": "emnefeltet på e-post" ,
                    "template": "some-email-template",
                    "tokens": [
                        { "name": "header", "value": "dette er en header" },
                        { "name": "body", "value": "Hei {{party.fullname}}!" } 
                    ]
                }
            }
        ],
        "push": [
            {
                "sentDateTime": "2022-12-01T10:00:00.000Z",
                "status": "ok",
                "notification": {            
                    "title": "Notification title",
                    "body": "Simple piece of body text.\nSecond line of body text :)",
                    "icon": "https://example.com/some-icon-atleast-192x192.png",
                    "notificationClickUrl": "https://example.com/some/deep/link/to/dialogues/123456789"
                }
            }    
        ]
    },
    // Skilles ut i egen modell / endepunkt
    // Dette er en logg vedlikeholdt av tjenesteeier som indikerer hva som logisk har skjedd gjennom den aktuelle 
    // dialogen. Dette tilgjengeliggjøres sluttbruker gjennom GUI og API, og vil  slås sammen med aktivitet foretatt i 
    // dialogporten, som kan være:
    // - videredelegering av instansen
    // - elementet åpnes for første gang
    // - sletting
    // 
    // Loggen er immuterbar - det kan bare legges til innslag gjennom PATCH-kall
    "activityLog": [
        { 
            "activityDateTime": "2022-12-01T10:00:00.000Z",
            // Her kan det være ulike typer som medfører ulik visning i GUI. F.eks. kan "feedback" være at det sendes en 
            // melding fra tjenesteeieren, f.eks. som en foreløpig tilbakemelding. URL kan da lenke til den konkrete 
            // meldingen
            "activityType": "change", 
                                      
            "performedBy": "person:12018212345",
            "activityDescription": [ { "code": "nb_NO", "value": "Dokumentet 'X' ble signert og kan sendes inn" } ],
            "activityDetailsUrl": "https://example.com/some/deep/link/to/dialogues/123456789/activitylog/1"
        },
        { 
            "activityDateTime": "2022-12-01T10:00:00.000Z",
            "activityType": "feedback",
            // Fravær av performedBy indikerer at det er tjenesteeieren som er utførende
            "activityDescription": [ { "code": "nb_NO", "value": "Foreløpig svar på saksbehandling" } ],
            "activityDetailsUrl": "https://example.com/some/deep/link/to/dialogues/123456789/message/2"
        }
    ],
    // HAL til relaterte ressurser
    "_links": {
        "self": { "href": "/dialogporten/api/v1/de/e0300961-85fb-4ef2-abff-681d77f9960e" },        
        
        // eget endepunkt for varslingslogg for elementet
        "notificationlog": { "href": "/dialogporten/api/v1/de/e0300961-85fb-4ef2-abff-681d77f9960e/notificationlog" }, 

        // eget endepunkt for aktivitetslogg for elementet
        "activitylog": { "href": "/dialogporten/api/v1/de/e0300961-85fb-4ef2-abff-681d77f9960e/activitylog" },         

        // Dyplenke til portalvisning for elementet i Dialogporten
        "serviceresource": { "href": "/resourceregistry/api/v1/resource/example_dialogue_service/" }, 

        // Dyplenke til portalvisning for elementet i Dialogporten
        "selfgui": { "href": "https://www.dialogporten.no/?expandElement=e0300961-85fb-4ef2-abff-681d77f9960e" }, 

        // Dyplenke til portalvisning for elementet hos tjenesteeier
        "externalgui": { "href": "https://example.com/some/deep/link/to/dialogues/123456789" } 
    }
}
```