# Srovnání s existujícími design systémy

Datum rešerše: 23. 8. 2026.

Účelem srovnání není tvrdit, že navržená architektura nahrazuje Material Design, Fluent nebo Carbon. Srovnání vymezuje, které běžné principy návrh přebírá a v čem je praktická otázka této práce užší a odlišná: explicitní sdílení sémantického jádra mezi webovým a herním UI při zachování platformních rozšíření.

## Kritéria

1. oddělení raw/reference hodnot od významových tokenů,
2. komponentní tokeny nebo komponentní mapování,
3. theming / změna hodnot podle kontextu,
4. více cílových platforem,
5. explicitní mechanismus platformně specifické adaptace,
6. zaměření na web + game UI jako jednu sdílenou tokenovou doménu.

## Přehled

| Systém | Tokenové vrstvy | Komponentní vrstva | Kontext / themes | Více platforem | Explicitní platformní odlišení | Web + game jako cíl |
|---|---|---|---|---|---|---|
| Material Design 3 | reference → system → component | ano | ano | ano, v rámci ekosystému Material | platformní implementace existují, ale tokenový model je primárně Material-specific | v prostudované dokumentaci není game UI formulováno jako primární cíl |
| Fluent 2 | global → alias | komponenty mapují design na kód | light/dark/high-contrast/brand | web, iOS, Android, Windows | ano, Fluent výslovně zdůrazňuje přirozenost na konkrétní platformě | v prostudované dokumentaci není game UI formulováno jako primární cíl |
| Carbon | core/global + contextual/theme tokens; vybrané component tokens | ano, pro vybrané komponenty | čtyři základní color themes a contextual layering | primárně IBM web/product ekosystém s více implementačními knihovnami | kontextové/theming rozlišení ano | v prostudované dokumentaci není game UI formulováno jako primární cíl |
| Navržený prototyp | primitive → shared semantic → component contracts → platform adapters | sdílené kontrakty + platformní rozšíření | web baseline + game overrides | dvě cílové reprezentace v rámci prototypu | **ano, tvoří explicitní hranici architektury** | **ano, jde o hlavní modelovou úlohu** |

## Interpretace

### Material Design 3

Material Design 3 používá tři třídy tokenů: reference, system a component. Tento princip podporuje oddělení konkrétních hodnot od jejich významu a od atributů komponent. Navržený prototyp z tohoto obecného principu vychází, ale nepřebírá Material vizuální jazyk. Praktická otázka práce spočívá v tom, jak nad sdílenou sémantikou vytvořit dvě odlišné kontextové realizace — webovou a herní.

Zdroj: https://m3.material.io/foundations/design-tokens

### Fluent 2

Fluent rozlišuje global tokens a alias tokens. Global token ukládá kontextově neutrální hodnotu, alias token jí přiřazuje význam. Fluent současně podporuje různé platformní knihovny a v design principles výslovně uvádí, že zkušenost má působit přirozeně na konkrétní platformě. To je blízké filozofii této práce: sdílení významu nemá znamenat identickou prezentaci.

Zdroje:
- https://fluent2.microsoft.design/design-tokens
- https://fluent2.microsoft.design/design-principles
- https://fluent2.microsoft.design/get-started/develop

### Carbon

Carbon používá tokeny pro konzistenci napříč komponentami a podporuje themes. Dokumentace popisuje také contextual layering tokens a component-specific color tokens. Přístup ukazuje, že kontextová změna hodnot je běžným principem robustního design systému. Tato práce používá obdobnou myšlenku kontextu, ale aplikuje ji na hranici web/game místo na vrstvy jedné produktové platformy.

Zdroje:
- https://carbondesignsystem.com/elements/themes/overview/
- https://carbondesignsystem.com/elements/color/tokens/
- https://carbondesignsystem.com/elements/color/usage/

## Co je převzatý princip a co vlastní návrh

### Převzaté / obecně používané principy
- tokenizace design decisions,
- oddělení raw hodnot a významových aliasů,
- komponentní tokeny,
- aliases a theming,
- strojově čitelný source of truth,
- generování technologicky specifických výstupů.

### Vlastní konstrukce v rámci bakalářského prototypu
- vymezení `shared semantic core` pro dvojici modelových prostředí web/game,
- explicitní hranice `platform adapter`,
- pravidla pro platform-specific additions a overrides,
- sdílené `component contracts` místo požadavku na sdílený komponentní kód,
- web/game mapping matrix,
- experiment s propagation změny přes oba platformní výstupy,
- experiment s platform isolation,
- vyhodnocení míry sdílených a platformních token references na dvou modelových případech.

## Omezení srovnání

Tabulka nehodnotí celkovou kvalitu ani úplnost jednotlivých design systémů. Material, Fluent a Carbon jsou rozsáhlé produkční systémy, zatímco výstup bakalářské práce je referenční prototyp zaměřený na jediný architektonický problém. Formulace „game UI není primární cíl“ znamená pouze to, že v citovaných veřejných materiálech nebylo nalezeno explicitní vymezení sdílené web/game token architecture; neznamená to technickou nemožnost použití daného systému v herním projektu.
