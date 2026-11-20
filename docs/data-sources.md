# 데이터 출처

## 텍스처 (`public/textures/`)

| 파일                                                                                               | 출처                                                                                                                                                                                | 라이선스                                        |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `mercury`, `venus`, `moon`, `mars`, `jupiter`, `saturn`, `saturn-ring`, `uranus`, `neptune`, `sun` | [Solar System Scope](https://www.solarsystemscope.com/textures/) 2K 텍스처                                                                                                          | CC BY 4.0                                       |
| `ceres`                                                                                            | [USGS Astrogeology: Ceres Dawn FC Global Mosaic 400m](https://astrogeology.usgs.gov/search/map/ceres_dawn_fc_global_mosaic_400m) (NASA/JPL-Caltech/UCLA/MPS/DLR/IDA, 지도 제작 DLR) | 저작자 표기 (Roatsch 외 2016, Preusker 외 2016) |
| `io`, `europa`, `ganymede`, `callisto`, `titan`, `pluto`                                           | [NASA 3D Resources](https://github.com/nasa/NASA-3D-Resources) (Images and Textures)                                                                                                | NASA 미디어 이용 지침 (출처 표기)               |
| `earth-albedo`, `earth-lights`, `earth-clouds`                                                     | [three.js 예제 텍스처](https://github.com/mrdoob/three.js/tree/r160/examples/textures/planets) (r160)                                                                               | MIT                                             |

Solar System Scope 텍스처는 NASA 고도·영상 자료를 바탕으로 만들어졌고(미탐사 지역은 비슷한 지형으로 채움), 1024×512 WebP로 줄였습니다(`cwebp -q 78 -resize 1024 512`). 토성 고리는 알파를 살려 1024×64로 줄였습니다. 지구 색·불빛은 2048×1024와 작은 화면용 1024×512(`-1024`) 두 벌이고, 구름(1024×512)은 알파 채널에 구름 양이 들어 있습니다. 태양(`2k_sun`)은 밝기만 따서 온도에 따른 색에 곱하고(쌀알 무늬·활동 영역), 세레스는 돈(Dawn) 탐사선 프레이밍 카메라의 전 지구 모자이크(DLR, 2015년 10월, 400 m/픽셀, 흑백 GeoTIFF)입니다. `sips`로 PNG로 바꿔 쓰고, 왼쪽 끝이 경도 0°라 반 바퀴 돌려 경도 0°를 가운데에 둔 뒤 밝기는 그대로 둔 채 옅은 잿빛 갈색을 입혔습니다(크레이터 그림자가 짙게 찍혀 있어 빈 곳 채우기는 하지 않음). 위성·왜행성·태양 텍스처는 `pnpm textures`(`scripts/build-textures.mjs`, libwebp의 `cwebp`·`dwebp` 필요)가 원본을 내려받아 1024×512 WebP로 만듭니다. NASA 3D Resources의 위성·명왕성 지도는 이때 손봅니다: 흑백인 유로파·가니메데·칼리스토는 밝기에 따라 실제 빛깔(유로파의 붉은 갈색 줄무늬, 어두운 칼리스토 등)로 칠했고, 지나치게 짙은 주황인 타이탄은 옅은 황갈색 안개로 바꿨으며, 자료가 빈 곳(이오의 검은 극지방, 칼리스토의 흐린 회색 부분)은 가장 가까운 경계에 비춘 주변 지형으로 채웠습니다. 핼리 혜성 핵과 아포피스는 NASA PDS의 실제 모양 모델을 씁니다: 아포피스 레이더 모양 모델(Brozović 외 2018, Lawrence·Benner, 꼭짓점 2000·면 3996, DOI 10.26033/ydyq-5756)과 Giotto·Vega 영상으로 만든 핼리 핵의 Stooke·Abergel 모델(경도·위도 5° 간격 반지름, DOI 10.26033/yt84-5y91)입니다. 자료실이 사람 확인으로 자동 내려받기를 막아, 브라우저로 받은 파일을 `pnpm shapes <OBJ> <TAB>`(`scripts/build-shapes.mjs`)로 16비트 꼭짓점 자료(`ui/scene/solar/shapeData.ts`, 따로 불러오는 조각)로 만듭니다. 불러오기 전에는 탐사·레이더로 알려진 크기 비율(핼리 약 15×8×8 km의 땅콩 모양, 아포피스 약 450×370 m의 길쭉한 모양)에 맞춰 언덕과 충돌구를 더한 근사 모양을 그리고, 두 모양 모두 셰이더 잡음으로 칠합니다(`ui/scene/solar/shapes.ts`).

출처 표기(CC BY 4.0 포함)는 README의 [출처](../README.md#출처) 표에 있고, 화면에는 그곳으로 가는 링크만 둡니다.

## 궤도 요소

| 자료                                           | 출처                                                                                                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 행성·명왕성 (평균 궤도 요소와 세기당 변화율)   | E. M. Standish, [Keplerian Elements for Approximate Positions of the Major Planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html), NASA JPL (1800~2050년 표) |
| 세레스, 아포피스, 핼리 혜성, 유성우 모천체 7개 | [JPL Small-Body Database API](https://ssd-api.jpl.nasa.gov/doc/sbdb.html) (`full-prec=1`, 2026년 11월 조회)                                                      |
| 자전축·본초 자오선                             | IAU WGCCRE 2015 보고서 (Archinal et al. 2018)                                                                                                                    |
| 달                                             | 평균 궤도 요소와 교점·근지점 세차 (Meeus, _Astronomical Algorithms_ 기반 근사)                                                                                   |
| 갈릴레이 위성                                  | Meeus의 평균 경도 (1976년 기준)                                                                                                                                  |

핼리 혜성은 1968년 접촉 궤도 요소의 모양(e, i, Ω, ω)에 1986→2061년 평균 주기에 맞춘 긴반지름(17.857 AU)을 써서 2061년 7월 28일 근일점을 기준으로 삼았습니다.

## 천체 자료

| 자료                       | 내용                                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 행성 물리량                | NASA Planetary Fact Sheet의 반지름·질량·중력·자전·평균 기온 (위성 수는 2025년 기준)                                                                     |
| 이웃 별 32곳               | 적경·적위·거리·분광형·질량·반지름·광도·온도 (널리 알려진 대략값)                                                                                        |
| 우리 은하·국부 은하군 천체 | 적경·적위·거리·크기 (대략값). 은하 좌표 변환은 ICRS → 은하 좌표 회전 행렬(J2000)                                                                        |
| 우주 거대 구조 17곳        | 방향·공동 거리·크기 대략값. 분류는 [나무위키 ‘우주 거대 구조’](https://namu.wiki/w/%EC%9A%B0%EC%A3%BC%20%EA%B1%B0%EB%8C%80%20%EA%B5%AC%EC%A1%B0)를 참고 |
| 유성우 9개                 | 극대 태양 황경·ZHR·복사점·속도 (국제유성기구 IMO 값 기준)                                                                                               |

## 모델 근거

| 모델           | 참고                                                                                                                        |
| -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 태양 진화      | Sackmann, Boothroyd & Kraemer (1993) _Our Sun III_; Schröder & Smith (2008) _Distant future of the Sun and Earth revisited_ |
| 거주 가능 영역 | Kopparapu et al. (2013)                                                                                                     |
| 충돌 크레이터  | Collins, Melosh & Marcus (2005) _Earth Impact Effects Program_                                                              |
| 궤도 편향      | DART 운동량 증폭 β(약 3.6), 중력 견인선(Lu & Love 2005)                                                                     |
| 초신성 오존    | Gehrels et al. (2003), 감마선 폭발은 Thomas et al. (2005), 킬로노바는 Perkins et al. (2024)                                 |
| 지구 궤도 이동 | Korycansky, Laughlin & Adams (2001) _Astronomical engineering_                                                              |
| 은하 충돌      | Toomre & Toomre (1972)의 제한된 N체 방식                                                                                    |
| 우주 거미줄    | Zel'dovich (1970) 근사, 성장 인자는 평탄 ΛCDM 적분 해 (Heath 1977)                                                          |

수치는 모두 교육용으로 단순화했습니다. 피해 규모와 구조물 효과는 대략적인 크기만 보여 줍니다.

## 성운 (우리 은하 규모)

석호(M8)·삼렬(M20)·용골자리(NGC 3372)·장미(NGC 2237)·북아메리카(NGC 7000)·말머리(B33)·고리(M57)·나선(NGC 7293)·고양이 눈(NGC 6543)·아령(M27)·베일(백조자리 고리)·타란툴라(30 Doradus) 성운 12곳을 더했습니다. 위치(적경·적위)와 거리는 SIMBAD·NASA·ESA 공개 자료의 대략값이고, 3D 구름의 빛깔은 성운 종류(발광·행성상·반사·암흑·초신성 잔해)에 따라 이 프로젝트에서 정했습니다. 설명은 직접 썼습니다.

## 우주적 존재 (신화 모드)

과학 모델 밖의 신화 모드입니다. 존재 94종의 이름·출전은 아래 원전과 전승에서 가져왔고, 설명(전승 한두 문장)은 모두 이 프로젝트에서 직접 썼습니다.

| 묶음                 | 출전                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 아우터 갓, 옛 지배자 | H. P. 러브크래프트(1890~1937)의 작품. 저작권 보호 기간이 끝난 퍼블릭 도메인                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 코스믹 호러          | 러브크래프트 「우주에서 온 색채」(1927), R. W. 체임버스(1865~1933) 『노란 옷의 왕』(1895, 퍼블릭 도메인). 감기지 않는 눈·별 없는 허기·울부짖는 성운은 이 프로젝트의 창작                                                                                                                                                                                                                                                                                                                                                                 |
| 엘더 갓              | 러브크래프트 작품에 나오는 옛 신(노덴스·히프노스·바스트)과 동아시아 창세 신화(여와·반고·마고)로 이 프로젝트가 꾸린 진영. 오거스트 덜레스 이후의 ‘엘더 갓 대 옛 지배자’ 설정 문장과 상표(Call of Cthulhu 등)는 쓰지 않음                                                                                                                                                                                                                                                                                                                  |
| 신들, 천사, 악마     | 이집트·바빌로니아·그리스·북유럽·중국 신화, 아브라함 계통 전승의 천사 품계, 서양 악마학(『솔로몬의 작은 열쇠』 등), 인도·불교 신화. 지금 믿는 사람이 많은 종교의 중심 신격은 넣지 않음                                                                                                                                                                                                                                                                                                                                                    |
| 신수 40종            | 동아시아 사신·사령·오방, 한국 설화, 『산해경』·『회남자』·『장자』, 『고사기』, 『리그베다』, 『에누마 엘리시』, 히브리 전승, 『샤나메』, 그리스 신화, 『에다』. 후보는 [나무위키 ‘상상의 동물’](https://namu.wiki/w/%EC%83%81%EC%83%81%EC%9D%98%20%EB%8F%99%EB%AC%BC)과 [‘상상의 동물/목록’](https://namu.wiki/w/%EC%83%81%EC%83%81%EC%9D%98%20%EB%8F%99%EB%AC%BC/%EB%AA%A9%EB%A1%9D)을 참고해 골랐고(CC BY-NC-SA 2.0 KR이라 문장은 옮기지 않음), 살아 있는 신앙의 성스러운 존재(가루다·나가·케찰코아틀·천둥새·무지개뱀 등)는 넣지 않음 |
| 영수 12종            | 동아시아 전승(『산해경』의 구미호·정위·필방, 비휴, 악몽을 먹는 맥, 달의 옥토끼·두꺼비 섬여, 신라 천마도의 천마), 일본 전승(누에, 뇌수 라이주), 유럽·서아시아 전승(유니콘, 그리핀). 이름과 줄거리만 참고하고 설명은 직접 씀                                                                                                                                                                                                                                                                                                               |
| 몬스터               | 크라켄(유럽 전승), 키메라(그리스 신화). 별고래·성운 해파리·별갉이는 이 프로젝트의 창작                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 거대 로봇            | 모두 이 프로젝트의 창작. 침묵의 거신은 ‘잠들어 있다 깨어나 기계만 멈추는 고대 거대 기계’라는 SF 개념만 참고했고(특정 게임의 이름·모습·설정은 쓰지 않음), 자기 복제 탐사선·항성 채굴은 SF 일반 개념                                                                                                                                                                                                                                                                                                                                       |

상성은 동아시아 오행의 상극(목→토→수→화→금→목)을 따르고, 빛(엘더 갓)과 혼돈의 관계는 이 프로젝트에서 정했습니다. 별자리 모습과, 모델이 없는 존재의 3D 몸(뱀·동양 용·고리 뱀·히드라, 공허, 구체 무리, 촉수 덩어리, 눈, 바퀴, 수확기, 날개 무리, 색채)은 이 프로젝트에서 계산으로 직접 만들었고, 나머지는 아래 3D 모델을 가공해 그립니다.

### 3D 모델 (`public/models/`)

우주적 존재의 3D 몸과 우주 대전의 작은 함선(전투기·호위함·구축함·순양함·무인기·비행접시 등)에 쓰는 모델 45종입니다. [Poly Pizza](https://poly.pizza)에서 받은 원본을 `pnpm models`(`scripts/build-models.mjs`)로 가공했습니다. 색·텍스처·UV·정점 색·법선을 지우고, 쓰지 않는 움직임과 작은 뼈를 덜고, 면을 줄여 meshopt로 압축했습니다. 장면은 이 모양을 빛나는 면과 선(홀로그램)으로만 그립니다. 원본 주소와 가공 설정은 `scripts/models/sources.json`에 있습니다. 우주전함·우주항공모함·드레드노트·궤도 요새 정거장·고대 요새·생체 모함은 모델을 받지 않고 이 프로젝트에서 계산으로 지었습니다(`ui/scene/solar/war/ships.ts`).

| 파일             | 쓰는 곳        | 모델                    | 저작자                | 사용 허락                                                     | 원본                                           |
| ---------------- | -------------- | ----------------------- | --------------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| `eagle.glb`      | 우주적 존재    | Flying Eagle            | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/Ug45M2A4Vv)  |
| `raven.glb`      | 우주적 존재    | Flying Raven            | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/p4puYPVor6)  |
| `parrot.glb`     | 우주적 존재    | Flying Parrot           | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/3wCiMpao0L)  |
| `stork.glb`      | 우주적 존재    | Flying Stork            | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/iO3aMS7KK8)  |
| `panther.glb`    | 우주적 존재    | Black Panther           | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/JcAlAQynld)  |
| `chowchow.glb`   | 우주적 존재    | Running Chow Chow       | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/DLocG67Tsn)  |
| `wolf.glb`       | 우주적 존재    | Running Wolf            | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/MyLvUaAaXO)  |
| `dog.glb`        | 우주적 존재    | Running Dog             | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/kv5eequb67)  |
| `horse.glb`      | 우주적 존재    | Galloping Horse         | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/idqRg0ucZ7)  |
| `elk.glb`        | 우주적 존재    | Running Elk             | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/nIkXY821lD)  |
| `deer.glb`       | 우주적 존재    | Leaping Deer            | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/BIq8fPvPeN)  |
| `bear.glb`       | 우주적 존재    | Running Brown Bear      | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/Coppphok4P)  |
| `goat.glb`       | 우주적 존재    | Charging Goat           | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/EHW8HuR2d7)  |
| `buffalo.glb`    | 우주적 존재    | Tar Buffalo             | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/hqvlYnTeQX)  |
| `spider.glb`     | 우주적 존재    | Black Widow Spider      | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/5YUViJK0lc)  |
| `centipede.glb`  | 우주적 존재    | Centipede               | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/3Yjp5vVR8L)  |
| `crawler.glb`    | 우주적 존재    | Crawling Shadow Man     | Google Data Arts Team | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/NNGmzNAiUX)  |
| `wizard.glb`     | 우주적 존재    | Evil Wizard             | AliceCassie           | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/bdxawstqtq)  |
| `dragon.glb`     | 우주적 존재    | Dragon                  | Quaternius            | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/VBvzjFIYws)  |
| `anglerfish.glb` | 우주적 존재    | Anglerfish              | Quaternius            | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/MRjSlwCjHM)  |
| `whale.glb`      | 우주적 존재    | Whale                   | Quaternius            | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/JGFwp6xWgk)  |
| `wasp.glb`       | 우주적 존재    | Wasp                    | Quaternius            | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/3aQgc75sUR)  |
| `spaceship.glb`  | 우주적 존재    | Spaceship               | Quaternius            | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/uCeLfsdmNP)  |
| `mech.glb`       | 우주적 존재    | Mech                    | Quaternius            | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/4UvIHxnoSR)  |
| `human.glb`      | 우주적 존재    | Animated Human          | Quaternius            | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/c3Ibh9I3udk) |
| `woman.glb`      | 우주적 존재    | Animated Woman          | Quaternius            | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/9kF7eTDbhO)  |
| `king.glb`       | 우주적 존재    | King                    | Quaternius            | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/I1gTjmuK2m)  |
| `octopus.glb`    | 우주적 존재    | Octopus                 | Poly by Google        | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/9F8QJKUT77V) |
| `squid.glb`      | 우주적 존재    | Squid                   | Poly by Google        | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/aOY1Ae28E9k) |
| `jellyfish.glb`  | 우주적 존재    | Jellyfish               | Poly by Google        | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/dA5osnS0Rzj) |
| `turtle.glb`     | 우주적 존재    | Turtle                  | Poly by Google        | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/fklSEvGm1Q8) |
| `colossus.glb`   | 우주적 존재    | Giant Robot             | Dann Beeson           | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/1kbGZOnhOwf) |
| `fighter-a.glb`  | 우주 대전 함선 | Spaceship               | Quaternius            | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/xNbtFQwirO)  |
| `fighter-b.glb`  | 우주 대전 함선 | Spaceship               | Quaternius            | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/DbGajMHrvp)  |
| `fighter-c.glb`  | 우주 대전 함선 | Spaceship               | Quaternius            | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/Jqfed124pQ)  |
| `frigate-a.glb`  | 우주 대전 함선 | Spaceship               | Quaternius            | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/PQzePrvBCD)  |
| `frigate-b.glb`  | 우주 대전 함선 | Spaceship               | Quaternius            | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/htfBk9vPfw)  |
| `pod.glb`        | 우주 대전 함선 | Spaceship               | Quaternius            | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/u105mYHLHU)  |
| `gunship.glb`    | 우주 대전 함선 | Spaceship               | Quaternius            | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/VSxUAFhzbA)  |
| `speeder-a.glb`  | 우주 대전 함선 | Space Craft Speeder     | Kenney                | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/mlQBUQRUpM)  |
| `speeder-b.glb`  | 우주 대전 함선 | Spacecraft Speeder      | Kenney                | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Poly Pizza](https://poly.pizza/m/PbD0M5Y6pS)  |
| `saucer.glb`     | 우주 대전 함선 | Flying saucer           | Poly by Google        | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/6hu2h8v78mO) |
| `scout.glb`      | 우주 대전 함선 | Venom Scout             | Aaron Clifford        | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/244-CCESo-F) |
| `concept.glb`    | 우주 대전 함선 | Spaceship Concept       | Yogoshimo 2.0         | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/9pBgIlbtj3F) |
| `starship.glb`   | 우주 대전 함선 | Starship McStarshipface | Jason Neufeld         | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)     | [Poly Pizza](https://poly.pizza/m/eMrqcfO5i9p) |
