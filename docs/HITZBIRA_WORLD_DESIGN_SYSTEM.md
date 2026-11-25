# HB-WORLD-DESIGN-001 · HITZBIRA WORLD DESIGN SYSTEM
Bertsioa 1.0.0 · 2026-11-25 · kalitate-egoera: preview / berrikusteko
Aplikazioaren bertsioa 1.5.0. Oinarria: feature/bira-world / 73529d81e6a0911533a4a761b32dcd21138e0a58.
Protokoloak: SUSTRAI 00, 01, 04, 05 eta 07 (2.1.0).

## Xedea
Adin guztietarako abentura-mundu koherentea, ez haur-interfaze hutsa. Erabiltzaileak istorioa aukeratzen du. A1–C2 erreferentzia akademikoak ez dira maparen ordena edo ikusizko mailak. Ez da adinik edo beste datu pertsonalik jasotzen diseinu-moduluan. Ez da gaitasun berririk egiaztatzen.

## Diseinu-tokenak
- Marka: #5B3CC4; iluna #4327A0. Bira: #FFDC79; testua #30234C; bigarren mailako testua #5F526F.
- Itsasoa #DEEDF0, papera #FFFFFF, oihala #F7F6FB, ertza #DED8EC.
- Oinarrizko espazioa 8px; ertzak 14 eta 22px; itzal arina. Sistema-tipografia; ez kanpoko letra-tipo eskakizunik.
- Uharteen identitate egonkorrak: noun (portua, morea), verb (harana, berdea), clause (zubia, urdina), compare (bidegurutzea, anbarra), text (itsasargia, arrosa). Ez aldatu ID teknikoak.
- Bira eta marka-logo historikoak mantendu. Ez dira faviconak ordezkatu.

## Aktibo bektorialak
world-design.js: island(id), cover(id), sea(); 5 uharte + 3 azal + itsas atlasaren hondoa. Jatorrizko SVG geometria, ez kanpoko argazkirik. Dekorazioa aria-hidden; ekintzak HTML botoietan eta testuan.
world-design.css: txartelak, azalak, 6 zutabeko atlas-sarea, misioen eszenak, 800/540px breakpoint-ak, focus-visible eta prefers-reduced-motion. SVG eskala berean berrerabili. Ez adierazi WCAG adostasuna auditoria independentea gabe.
Ez erabili kolorea bakarrik eginkizun edo egoera adierazteko. Ez derrigorrezko animaziorik, ez zigorrik.

## Integrazioa
Hasiera, Praktikatu eta Nire bidea: istorioen katalogo bera; 3 azalak, 6 lehengo bide narratiboak. Ikasi eta beste azalera batzuk: bost uharteen irudi berriak. Nire bidea: 5 botoiko atlas interaktiboa, ibilbide apaingarriak ez dira aurrebaldintzak; botoiak lehengo areaEvidence eta mapSelect funtzioetara. Misioaren prestaketa-eszenan azal beraren miniatura. Ez aldatu world.js, core.js, ariketa-bankuak edo zuzenketa. worldDone tokiko jardunaren marka da, ez gaitasuna. Azken ekoizpen irekiak ez dira ebaluatzen/gordetzen. 
index.html, sw.js eta pwa.js: 1.5.0; bi diseinu-fitxategiak offline cacheko zerrendan. Ez aldatu localStorage gakoak.
Aurrerapena domeinuaren araberakoa da. Previewak ez du aurreko beste domeinuko tokiko datuen migraziorik egiten.

## Egiaztapena eta mugak
23 kode/asset/integrazio egiaztapen pasatu; 17 funtzio-egiaztapen DOM eta storage bikoitz sinplearekin, benetako bost bankuak kargatuz eta hiru misio ibilbide osatuz. Ez da nabigatzaile errealeko render/teklatu/mugikor/PWA offline proba. Horiek eta adin guztietako erabiltzaileen pilotua falta dira. Ebidentzia akademikorik ez; ez da GOLD. Ez produkzioko main, Supabase edo egiaztatutako edukien argitalpen baimenik aldatu.
Hurrengo lana: munduko pertsonaiak eta eszena komunikatibo propioak, benetako transferentzia eta feedbackaren baliozkotzea; ez gehitu ariketa kopuruagatik soilik.

## Aldaketen erregistroa
HB-DS-001: 1.4ko ikono abstraktuak → paisaia bektorialak; art identitatea, ez edukia.
HB-DS-002: 1.4ko txartel neutroak → misio bakoitzaren azal bereizia; katalogo bera hiru ataletatik.
HB-DS-003: mapa → atlas; datu eta nabigazio kontratu bera, ez maila linealik.
HB-DS-004: 1.5.0 cache; diseinu-modulua eta estiloa bertsionatuta.
