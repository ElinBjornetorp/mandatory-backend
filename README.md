# Obligatorisk inlämning - Backend
**Sista datumet för inlämning är 12 juni 09:00**

## Inlämning

Inlämningen ska ske på Ping Pong. Lämna in en länk till ett git repository. Uppgiften ska ha gjorts på **master** branchen.   

## Resurser
[https://nodejs.org/api/](https://nodejs.org/api/)   
[https://socket.io/](https://socket.io/)

## Instruktioner

Du ska bygga en chatt applikation. Det ska finnas både en frontend samt en backend för applikationen. Det finns inga krav på hur frontenden ska se ut eller fungera.   

* Chatten ska som slack ha stöd för flera rum - dvs skriver man i ett specifikt rum ska meddelandet endast visa i rummet. 
* Man ska kunna skapa och ta bort rum - alla rum ska ha ett unikt namn
* Varje meddelande har info om vem som skrev det
* Chatten ska ha stöd för real-time meddelanden (rekommenderar socket.io)
* Rummen & alla meddelanden ska sparas långsiktigt (t.ex. i en eller flera filer). Dvs när man startar om servern ska allting vara kvar
* Varje rum ska ha en lista på alla användare som har skrivit något tidigare

## Bonuspoäng

* Visa alla användare som är aktiva i chatten
* Lägg till logik för “skriver just nu “ (visas oftas som ... )
* Lägg till låsta rum - ett rum som kräver att man anger ett lösenord för att kunna komma åt
* Direktmeddelanden till andra användare
* Profilbilder
* Emojis
* Editera & ta bort gamla meddelanden
