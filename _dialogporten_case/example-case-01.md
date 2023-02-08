---
menutitle: Eksempel 01
title: Eksempel-flyt basert på Skatts case ("superenkel innsending")
layout: page
toc: true
---

## Oversikt over steg

Dette er en variant hvor SBS-et initierer dialogen med å gjøre et kall direkte til Skatteetatens API. Overordnet er prosessen som beskrives under som sådan:

1. SBS sender inn noe 
2. Skatt sender svar tilbake (som varsles) med forespørsel om mer info
3. SBS sender inn mer
4. Skatt sender svar og lukker saken 


## 1. SBS gjør en innsending

SBS sender inn noe på vegne av organisasjonsnummer 91234578 VIRKSOMHET AS. Her er det delt opp i to kall, men det er helt vilkårlig.

```
POST api.skatteetaten.no/skattemeldingsdialog/ 
{
  ... en eller annen modell
}
// (returnerer dialogId: 11111111-1111-1111-1111-111111111111)

POST skatt.api.no/skattemeldingsdialog/11111111-1111-1111-1111-111111111111/innsending/ 
{
    ... en eller annen modell
}
// (returnerer dialogElementId på innsendt skattemelding: 22222222-2222-2222-2222-222222222222)
```
    
## 2. Skatteetaten mottar innsending  

Dialogen opprettes i DP, og settes i en tilstand som indikerer at den er under behandling hos Skatt. 

```    
// Merk! Forenklet modell
POST dialogporten.no/api/v1/de/ 
{
    "id": "11111111-1111-1111-1111-111111111111",
    "party": "org:91234578",
    "serviceResourceIdentifier": "super-simple-service",
    "status": "waiting",
    "actions": [ "open", "cancel-application", "read-more-about-process" ],
    "activityLog": [
        {            
            "activityId": "22222222-2222-2222-2222-222222222222",
            "activityType": "submission",
            "activityDescription": "Søknad sendt til behandling",
            "activityDetailsUrl": "<referanse til innsending>"
        }
    ]
}
```

## 3. Dialogporten sender events

Opprettelsen av dialogen medfører at det genereres en eller flere events. Denne følger [external event-modellen](https://docs.altinn.studio/technology/architecture/capabilities/runtime/integration/events/#example-4--external-event) i Altinn Events.

```
{
    "specversion": "1.0",
    "type": "urn:dialogporten:dialog:created",
    "source": "urn:altinn:serviceresource:super-simple-service:11111111-1111-1111-1111-111111111111", 
    "subject: "org/91234578",
    "affectedentityuri": "https://dialogporten.no/api/v1/de/11111111-1111-1111-1111-111111111111",
}   
```

Ethvert nytt innslag i activityLog genererer også events. Siden dette ble oppgitt i POST-en over, genereres en event:

```
{
    "specversion": "1.0",
    "type": "urn:dialogporten:dialog:activity:information",
    "source": "urn:altinn:serviceresource:super-simple-service:11111111-1111-1111-1111-111111111111", 
    "subject: "org/91234578",
    "affectedentityuri": "https://dialogporten.no/api/v1/de/11111111-1111-1111-1111-111111111111/activitylog/22222222-2222-2222-2222-222222222222",
}   
```

## 4. Medarbeider åpner tilfeldigvis dialogen

Mens Skatteetaten behandler oppgaven går en eller annen ansatt for VIRKSOMHET AS inn Felles arbeidsflate (GUI) og finner dialogen (fordi vedkommende er autorisert gjennom policy), som han/hun åpner. Dette innebærer at Dialogporten gjør et innslag i activityLog på dialogen ...


```
{ 
    "activityId": "387cfaa8-8113-43c1-a457-603be651ecb9", // Dialogporten genererer en activityId
    "activityDateTime": "2022-12-01T10:15:00.000Z",
    "activityType": "seen",
    "performedBy": "person:12018212345",
}
```

... som igjen medfører at det genereres en hendelse ...

```
{
    "specversion": "1.0",
    "type": "urn:dialogporten:dialog:activity:seen",
    "source": "urn:altinn:serviceresource:super-simple-service:11111111-1111-1111-1111-111111111111",
    "subject: "org/91234578",
    "affectedentityuri": "https://dialogporten.no/api/v1/de/11111111-1111-1111-1111-111111111111/activitylog/387cfaa8-8113-43c1-a457-603be651ecb9",
}   
```

`seen`-aktiviteter oppstår første gang dialog åpnes/lastes etter opprettelse, og første gang dialogen åpnes/lastes etter et `feedback`-innslag er lagt i aktivitetsloggen. Tjenestetilbyder har tilgang til å abonnerere på disse hendelsene. Merk at dette ikke må forstås som at elementet er _lest_, da dette er informasjon Dialogporten ikke sitter på.

## 5. Skatt har behandlet innsendingen

Saksbehandlingen har avdekket at det er behov for å innhente ytterligere opplysninger, så skatt sender et svar hvor det etterspørres mer informasjon:

```    
// Merk! Forenklet modell
PATCH dialogporten.no/api/v1/de/11111111-1111-1111-1111-111111111111
{
    "status": "in-progress",
    "content": "Vi har behandlet søknaden din, og ser vi trenger mer opplysninger.",
    // ny action "fill-in" som leder til et nytt innsendingssteg
    "actions": [ "fill-in, "open", "cancel-application", "read-more-about-process" ],  
    "activityLog": [
        {
            "activityId": "33333333-3333-3333-3333-333333333333",
            "activityType": "feedback",
            "activityRelatedId": "22222222-2222-2222-2222-222222222222",
            "activityExtendedType": "form-rf1234-required", // maskinlesbar
            "activityDescription": "Behandling foretatt, mer informasjon forespurt",
            "activityDetailsUrl": <evt. referanse som gir mer informasjon om hva som har skjedd>
        }
    ]
}
```

## 6. Dialogporten genererer events basert på endringen
 
En PATCH kan medføre at flere events blir generert, som muliggjør finkornet filtering på events en bryr seg om (filter kan settes med prefix-match på "type" og/eller source, og på subject). Ikke alle endringer genererer events (f.eks. endring på `content` er ikke i seg selv noe som genererer en event)

```
{
    "specversion": "1.0",
    "type": "urn:dialogporten:dialog:activity:feedback",
    "source": "urn:altinn:serviceresource:super-simple-service:11111111-1111-1111-1111-111111111111",
    "subject: "org/91234578",
    "affectedentityuri": "https://dialogporten.no/api/v1/de/11111111-1111-1111-1111-111111111111/activitylog/33333333-3333-3333-3333-333333333333",
}

{
    "specversion": "1.0",
    "type": "urn:dialogporten:dialog:change:status",
    "source": "urn:altinn:serviceresource:super-simple-service:11111111-1111-1111-1111-111111111111",
    "subject: "org/91234578",
    "affectedentityuri": "https://dialogporten.no/api/v1/de/11111111-1111-1111-1111-111111111111",
}

{
    "specversion": "1.0",
    "type": "urn:dialogporten:dialog:change:actions",
    "source": "urn:altinn:serviceresource:super-simple-service:11111111-1111-1111-1111-111111111111",
    "subject: "org/91234578",
    "affectedentityuri": "https://dialogporten.no/api/v1/de/11111111-1111-1111-1111-111111111111",
}

```

## 7. SBS mottar hendelse, laster dialogen, og sender inn ytterligere opplysninger

SBS-et har et abonnement som plukker opp at det har kommet en tilbakemelding i dialogen. SBS-et laster activitylog-innslaget referert i eventen, 

```
GET https://dialogporten.no/api/v1/de/11111111-1111-1111-1111-111111111111/activitylog/33333333-3333-3333-3333-333333333333
```

og ser utfra `activityExtendedType` at det er behov for å sende inn et ytterligere skjema (tjenestespesifikk logikk).  En medarbeider varsles, som laster/åpner dialogen gjennom SBS-et, 

```
GET https://dialogporten.no/api/v1/de/11111111-1111-1111-1111-111111111111/
```

og ser at det er kommet et svar med forespørsel om mer informasjon. Siden det er mottatt en feedback siden forrige gang dialogen ble åpnet, vil lastingen av dialogen (forrige request) igjen føre til at det genereres en hendelse som i trinn 4.

Actionen 'fill-in' som har dukket opp gir SBS-et informasjon om hvilket endepunkt de ytterligere opplysningene skal sendes til, og kan også inneholde informasjon om forventet datamodell (dette er typisk noe SBS-et allerede har kjennskap til)

Gjennom SBS-et sender medarbeideren inn opplysningene som manglet:

```
POST skatt.api.no/skattemeldingsdialog/11111111-1111-1111-1111-111111111111/ytterligere-innsending/ 
{
    ... en eller annen modell
}
// returnerer en eller annen modell, og evt en identifikator for innsendingen
```

## 8. Skatteetaten mottar ytterligere opplysninger

Skatteetaten mottar innsendingen, som valideres maskinelt. Dialogen kan nå avsluttes. 

```
PATCH dialogporten.no/api/v1/de/11111111-1111-1111-1111-111111111111
{
    "status": "completed",
    "content": "Søknaden er behandlet og vedtaksbrev er vedlagt.",
    // ny action "appeal" som starter en klageprosess
    "actions": [ "open", "appeal ],
    "attachments": [
        {
            "displayName": "Vedtaksbrev",
            "sizeInBytes": 123456,
            "contentType": "application/pdf",            
            "url": "https://api.skatt.no/attachments/11111111-1111-1111-1111-111111111111/vedtaksbrev.pdf",
        }
    ]
    "activityLog": [
        {
            "activityId": "4444444-4444-4444-4444-444444444444",
            "activityType": "closed",
            "activityDescription": "Sak avsluttet",
            "activityDetailsUrl": <evt. referanse som gir mer informasjon om vedtak, klageadgang etc>
        }
    ]
}
```

## 9. Dialogporten genererer hendelser basert på endringene

```
{
    "specversion": "1.0",
    "type": "urn:dialogporten:dialog:activity:closed",
    "source": "urn:altinn:serviceresource:super-simple-service:11111111-1111-1111-1111-111111111111",
    "subject: "org/91234578",
    "affectedentityuri": "https://dialogporten.no/api/v1/de/11111111-1111-1111-1111-111111111111/activitylog/4444444-4444-4444-4444-444444444444",
}

{
    "specversion": "1.0",
    "type": "urn:dialogporten:dialog:change:status",
    "source": "urn:altinn:serviceresource:super-simple-service:11111111-1111-1111-1111-111111111111",
    "subject: "org/91234578",
    "affectedentityuri": "https://dialogporten.no/api/v1/de/11111111-1111-1111-1111-111111111111",
}

{
    "specversion": "1.0",
    "type": "urn:dialogporten:dialog:change:actions",
    "source": "urn:altinn:serviceresource:super-simple-service:11111111-1111-1111-1111-111111111111",
    "subject: "org/91234578",
    "affectedentityuri": "https://dialogporten.no/api/v1/de/11111111-1111-1111-1111-111111111111",
}

{
    "specversion": "1.0",
    "type": "urn:dialogporten:dialog:change:attachments",
    "source": "urn:altinn:serviceresource:super-simple-service:11111111-1111-1111-1111-111111111111",
    "subject: "org/91234578",
    "affectedentityuri": "https://dialogporten.no/api/v1/de/11111111-1111-1111-1111-111111111111",
}

```