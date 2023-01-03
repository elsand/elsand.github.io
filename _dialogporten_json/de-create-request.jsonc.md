---
---
```jsonc
// Input modell som tjenesteeiere oppgir for å opprette et element.
// Modellen kan også oppdateres/muteres med PATCH-kall som inneholder de feltene som en ønsker å endre. 
//Ikke-komplekse felter som ligger på rotnivå kan ikke endres (med unntak av "status").

// POST /dialogporten/api/v1/de
{
    // Identifikator som refererer en tjenesteressurs ("Altinn Service Resource") i Altinn Autorisasjon
    // Se https://docs.altinn.studio/technology/solutions/altinn-platform/authorization/resourceregistry/
    // Dette bestemmer også hvilken autorisasjonspolicy som legges til grunn for både ressursen og tilhørende
    "serviceResourceIdentifier": "example_dialogue_service", 

    // Organisasjonsnummer, fødselsnummer eller brukernavn (aka "avgiver" eller "aktør") - altså hvem sin dialogboks 
    // skal elementet tilhøre. Brukernavn benyttes for selv-registrerte bruker, og er typisk en e-postadresse.
    "party": "org:991825827", 
                                  
    // Vilkårlig referanse til ekstern dialoginstans. Dialogporten tilegger denne ingen semantikk (trenger f.eks. ikke
    // være unik)
    "externalReference": "123456789",

    // Alle dialogbokselementer som har samme dialoggruppe-id vil kunne grupperes eller på annet vis samles i GUI    
    "dialogueGroup": {
        "id": "some-arbitrary-id",
        
        // Bestemmer rekkefølgen dette elementet har blant alle elementer som har samme dialogueGroup.id
        "order": 1,
        
        // Trenger bare oppgis av ett dialogbokselement. Hvis oppgitt av flere, er det den med høyest "order"-verdi 
        // som skal benyttes.
        "name": [ { "code": "nb_NO", "value": "Navn på dialoggruppe." } ]
    },

    // Kjente statuser som bestemmer hvordan elementet vises for bruker: 
    // "unspecified"    = Elementet har ingen spesiell status. Brukes typisk for enkle meldinger som ikke krever noe 
    //                    interaksjon. Dette er default. 
    // "under-progress" = Under arbeid. Generell status som brukes for dialogtjenester der ytterligere bruker-input er 
    //                    forventet.
    // "waiting"        = Venter på tilbakemelding fra tjenesteeier
    // "signing"        = Dialogen er i en tilstand hvor den venter på signering. Typisk siste steg etter at all  
    //                    utfylling er gjennomført og validert. 
    // "cancelled"      = Dialogen ble avbrutt. Dette gjør at elementet typisk fjernes fra normale GUI-visninger.
    // "completed"      = Dialigen ble fullført. Dette gjør at elementet typisk flyttes til et GUI-arkiv eller lignende.
    "status": "under-progress", 
    "dates": {
        // Hvis oppgitt blir elementet satt med en frist 
        // (i Altinn2 er denne bare retningsgivende og har ingen effekt, skal dette fortsette?)
        "dueDateTime": "2022-12-01T12:00:00.000Z",
        
        // Mulighet for å skjule/deaktivere et element på et eller annet tidspunkt?
        "expiryDate": "2023-12-01T12:00:00.000Z" 
    },
    "content": {
        // Alle tekster som vises verbatim må oppgis som en array av oversatte tekster. 
        // Det som benyttes er brukerens valgte språk i Dialogboksen
        "body": [ { "code": "nb_NO", 
            "value": "Innhold med <em>begrenset</em> HTML-støtte. Dette innholdet vises når elementet ekspanderes." } ],
        "title": [ { "code": "nb_NO", "value": "En eksempel på en tittel" } ],
        "senderName": [ { "code": "nb_NO", "value": "Overstyrt avsendernavn (bruker default tjenesteeiers navn)" } ]            
    },  
    "attachments": [
        {
            "displayName": [ { "code": "nb_NO", "value": "dette er et vedlegg" } ],
            "sizeInBytes": 123456,
            "contentType": "application/pdf",            
            "url": "https://example.com/api/dialogues/123456789/attachments/1",

            // Det kan oppgis en valgfri referanse til en ressurs. Brukeren må ha tilgang til "open" i
            // XACML-policy for oppgitt ressurs for å få tilgang til elementet.
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
                "resource": "somesubresource", // Det kan oppgis en valgfri referanse til en ressurs
                "type": "secondary",
                "title": [ { "code": "nb_NO", "value": "Bekreft mottatt" } ],

                // Dette foretar et POST bakkanal-kall til oppgitt URL, og det vises i frontend bare en spinner mens 
                // kallet går. Må returnere en oppdatert DE-modell (som da vises bruker) eller 204 (hvis elementet 
                // oppdatert i annet bakkanal-kall), eller en RFC7807-kompatibel feilmelding.
                "isBackChannel": true, 

                "url": "https://example.com/some/deep/link/to/dialogues/123456789/confirmReceived"
            },
            { 
                "action": "delete",
                "type": "tertiary",
                "title": [ { "code": "nb_NO", "value": "Avbryt" } ],

                // Dette impliserer isBackChannel=true, og viser i tillegg en "Er du sikker?"-prompt. 
                // Vil ved vellykket kall skjule elementet fra GUI, og legge elementet i søppelkasse
                "isDeleteAction": true, 

                // Blir kalt med DELETE i bakkanal. Må returnere 204 eller en RFC7807-kompatibel feilmelding.
                "url": "https://example.com/some/deep/link/to/dialogues/123456789" 
            }
        ],
        "api": [ 
            { 
                "action": "open", // Denne kan refereres i XACML-policy
                "actionUrl": "https://example.com/api/dialogues/123456789",
                "method": "GET",

                // Indikerer hva API-konsumenter kan forvente å få slags svar
                "responseSchema": "https://schemas.altinn.no/de/v1/de.json", 
                // Lenke til dokumentasjon for denne actionen
                "documentationUrl": "https://api-docs.example.com/dialogueservice/open-action" 
            },
            { 
                "action": "confirm",
                "method": "POST",
                "actionUrl": "https://example.com/api/dialogues/123456789/confirmReceived",
                "documentationUrl": "https://api-docs.example.com/dialogueservice/confirm-action"
                // Ingen requestmodell impliserer tom body
            },
            { 
                "action": "submit", // Denne kan refereres i XACML-policy
                "actionUrl": "https://example.com/api/dialogues/123456789",
                "method": "POST",
                
                // Indikerer hva API-et forventer å få som input på dette endepunktet
                "requestSchema": "https://schemas.example.com/dialogueservice/v1/dialogueservice.json", 
                "responseSchema": "https://schemas.altinn.no/de/v1/de.json" 
            },
            { 
                "action": "delete",
                "method": "DELETE",

                // Merk dette vil kreve at org gjør bakkanal-kall for å slette elementet
                "actionUrl": "https://example.com/api/dialogues/123456789"
            }
        ]
    },
    // Hvis en ønsker varsling, kan dette spesifiseres under på ulike endepunkter ref KRR / KoFuVI / varslingsadresser 
    /// oppgitt i Altinn. Ytterligere notifications kan sendes med å gjøre et PATCH-kall til 
    "notifications": {
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
    },
    "activityLog": [
        {
            // Typisk tom ved opprettelse, men kan populeres av tjenesteeier etter eget forgodtbefinnende
        }
    ],
    // Dette er ulike innstillinger som kun kan oppgis og er synlig for tjenesteeier
    "configuration": {
        // Hvis tjenesteeieren ønsker en "rekommandert" sending, kan dette flagget settes til true. Det vil da genereres 
        // en event om at elementet er lest til. 
        "requireReadNotification": true,
        // Når blir elementet synlig hos party
        "visibleDateTime": "2022-12-01T12:00:00.000Z",
        "authorization": {
            // Policy defineres av serviceResourceIdentifier, men det kan også legges på en ytterligere policy, som i 
            // tillegg til/i stedet for referert service resource sin policy må etterleves for kun dette ene objektet. 
            // Dette muliggjør individuell tilgangsstyring på elementnivå, som f.eks. når bare nærmeste leder til 
            // en ansatt skal ha kunne se dialogelementer fra NAV ifm en sykmelding. 
            // Basert på en forenklet variant av XACML, se https://github.com/Altinn/altinn-studio/issues/5016. 
     
            // I dette eksemplet gis tilgang til to eksplisitt oppgitte personer, samt en tilgangsgruppe. 
            // "Subjects" kan være organisasjoner, innehavere av roller (eksterne), medlemmer av tilgangsgrupper. Se
            // https://altinn.github.io/docs/utviklingsguider/styring-av-tilgang/for-tjenesteeier/forslag-tilgangsgrupper/

            // "Both"         = både inline policy og policy refert til av serviceResource må gi "Permit" for at en gitt 
            //                  action skal godkjennes for det aktuelle subjectet (AND-ing)
            // "Either"       = enten inline policy eller policy refert til av serviceResource (eller begge) må gi 
            //                  "Permit" for at en gitt action skal godkjennes for det aktuelle subjectet (OR-ing). 
            //                  Dette er default.
            // "InlineOnly"   = kun "Permit" fra inline policy gjør at en gitt action godkjennes for det aktuelle 
            //                  subjectet.
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
                        "accessgroup:taushetsbelagt",
                        "scope:someprefix:somescopeinmaskinportenoridporten"
                    ],
                    "Resources": [
                        // Har ikke tilgang til "attachment1"
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
    }
}
```