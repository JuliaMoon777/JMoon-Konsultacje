// Inlined master celestial emblem SVG for instant, synchronous, 100% reliable pixel sampling
export const LOGO_SVG_MARKUP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 800" width="700" height="800">
  <defs>
    <radialGradient id="sunDiscGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="22%" stop-color="#FFE48A" />
      <stop offset="52%" stop-color="#E2A633" />
      <stop offset="80%" stop-color="#9E6514" />
      <stop offset="100%" stop-color="#4A2A04" />
    </radialGradient>

    <linearGradient id="goldRayGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF5B8" />
      <stop offset="35%" stop-color="#E8B342" />
      <stop offset="75%" stop-color="#AD751B" />
      <stop offset="100%" stop-color="#5E3807" />
    </linearGradient>

    <linearGradient id="goldRayGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFBE0" />
      <stop offset="30%" stop-color="#F2C558" />
      <stop offset="70%" stop-color="#BD8424" />
      <stop offset="100%" stop-color="#6B4109" />
    </linearGradient>

    <linearGradient id="goldReliefGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBE8" />
      <stop offset="25%" stop-color="#F4CB61" />
      <stop offset="60%" stop-color="#CA8F25" />
      <stop offset="85%" stop-color="#8C5811" />
      <stop offset="100%" stop-color="#4E2E05" />
    </linearGradient>

    <linearGradient id="silverFaceGrad" x1="20%" y1="10%" x2="90%" y2="90%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="25%" stop-color="#EFF4FA" />
      <stop offset="55%" stop-color="#B8C4D2" />
      <stop offset="82%" stop-color="#7B8898" />
      <stop offset="100%" stop-color="#414C5A" />
    </linearGradient>

    <radialGradient id="silverHeartGrad" cx="32%" cy="28%" r="68%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="28%" stop-color="#F0F4F8" />
      <stop offset="60%" stop-color="#B5C2D2" />
      <stop offset="88%" stop-color="#728092" />
      <stop offset="100%" stop-color="#3A4452" />
    </radialGradient>

    <linearGradient id="silverScrollGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="35%" stop-color="#D4DEE9" />
      <stop offset="70%" stop-color="#8F9CAE" />
      <stop offset="100%" stop-color="#455060" />
    </linearGradient>
  </defs>

  <!-- PURE JET BLACK BACKGROUND (as requested: luminance < 70 = zero particles) -->
  <rect width="700" height="800" fill="#000000" />

  <!-- 1. LEFT SIDE: RADIANT GOLDEN SUN WITH 22 SCULPTED RAYS -->
  <g id="sun-rays">
    <!-- Top Tallest Sculpted Flame Ray -->
    <path d="M 185 278 C 170 230 162 170 190 120 C 196 110 205 105 204 116 C 200 138 206 172 216 210 C 220 230 221 260 215 278 Z" fill="url(#goldRayGrad1)" stroke="#FFF2A8" stroke-width="1.0" />
    <path d="M 197 114 Q 200 190 202 278" stroke="#FFEBA8" stroke-width="1.6" fill="none" />

    <!-- Top-Right Flame 1 -->
    <path d="M 215 280 C 228 235 242 188 232 145 C 230 138 238 139 242 148 C 255 180 248 220 242 260 C 240 272 236 282 232 288 Z" fill="url(#goldRayGrad2)" stroke="#FFF2A8" stroke-width="1.0" />

    <!-- Top-Right Flame 2 -->
    <path d="M 238 296 C 265 260 292 215 284 175 C 282 168 290 170 295 180 C 304 212 286 250 272 285 C 265 300 258 310 252 318 Z" fill="url(#goldRayGrad1)" stroke="#FFF2A8" stroke-width="1.0" />

    <!-- Right-Upper Flame -->
    <path d="M 262 330 C 295 315 330 295 342 272 C 345 266 350 272 348 280 C 336 308 305 332 280 350 C 275 354 270 357 265 359 Z" fill="url(#goldRayGrad2)" stroke="#FFF2A8" stroke-width="1.0" />

    <!-- Right-Mid Flame -->
    <path d="M 265 375 C 298 370 338 368 355 352 C 360 348 363 355 358 362 C 342 384 308 392 278 398 C 270 400 262 401 258 400 Z" fill="url(#goldRayGrad1)" stroke="#FFF2A8" stroke-width="1.0" />

    <!-- Right-Lower Flame -->
    <path d="M 252 418 C 285 430 322 445 338 468 C 342 474 336 478 330 475 C 308 460 280 445 250 435 C 245 433 240 430 236 428 Z" fill="url(#goldRayGrad2)" stroke="#FFF2A8" stroke-width="1.0" />

    <!-- Bottom-Right Flame 1 -->
    <path d="M 238 438 C 265 470 295 510 290 550 C 288 558 280 556 276 548 C 264 515 248 480 228 450 Z" fill="url(#goldRayGrad1)" stroke="#FFF2A8" stroke-width="1.0" />

    <!-- Bottom-Right Flame 2 -->
    <path d="M 218 455 C 235 500 248 548 240 592 C 238 600 230 598 226 590 C 215 555 210 515 204 465 Z" fill="url(#goldRayGrad2)" stroke="#FFF2A8" stroke-width="1.0" />

    <!-- Bottom Tallest Sculpted Flame Ray -->
    <path d="M 204 465 C 205 515 212 575 198 630 C 195 640 186 638 186 626 C 188 585 180 540 172 465 Z" fill="url(#goldRayGrad1)" stroke="#FFF2A8" stroke-width="1.0" />
    <path d="M 194 628 Q 192 540 190 465" stroke="#FFEBA8" stroke-width="1.6" fill="none" />

    <!-- Bottom-Left Flame 1 -->
    <path d="M 172 462 C 160 510 145 558 128 595 C 122 602 115 598 118 588 C 132 545 142 505 152 458 Z" fill="url(#goldRayGrad2)" stroke="#FFF2A8" stroke-width="1.0" />

    <!-- Bottom-Left Flame 2 -->
    <path d="M 152 452 C 130 490 102 530 78 558 C 72 565 65 560 68 550 C 86 515 108 478 132 440 Z" fill="url(#goldRayGrad1)" stroke="#FFF2A8" stroke-width="1.0" />

    <!-- Left-Lower Flame -->
    <path d="M 134 430 C 100 455 60 480 32 492 C 25 495 22 488 28 482 C 55 458 92 432 124 415 Z" fill="url(#goldRayGrad2)" stroke="#FFF2A8" stroke-width="1.0" />

    <!-- Left-Mid Flame -->
    <path d="M 124 405 C 88 412 45 415 20 405 C 12 402 14 394 22 393 C 58 388 98 382 122 380 Z" fill="url(#goldRayGrad1)" stroke="#FFF2A8" stroke-width="1.0" />

    <!-- Left-Upper Flame 1 -->
    <path d="M 122 370 C 85 355 42 338 25 318 C 20 312 25 306 32 310 C 62 328 100 345 126 352 Z" fill="url(#goldRayGrad2)" stroke="#FFF2A8" stroke-width="1.0" />

    <!-- Left-Upper Flame 2 -->
    <path d="M 128 340 C 98 312 65 275 52 240 C 48 232 56 228 62 235 C 85 268 115 300 138 322 Z" fill="url(#goldRayGrad1)" stroke="#FFF2A8" stroke-width="1.0" />

    <!-- Top-Left Flame 1 -->
    <path d="M 142 312 C 120 272 98 228 96 182 C 95 174 104 172 108 180 C 122 220 142 260 160 295 Z" fill="url(#goldRayGrad2)" stroke="#FFF2A8" stroke-width="1.0" />

    <!-- Top-Left Flame 2 -->
    <path d="M 162 290 C 150 245 142 195 152 150 C 154 142 162 142 165 150 C 172 190 178 235 184 278 Z" fill="url(#goldRayGrad1)" stroke="#FFF2A8" stroke-width="1.0" />
  </g>

  <!-- Sun Central 3D Sphere Core -->
  <g id="sun-core">
    <circle cx="200" cy="360" r="76" fill="#422502" />
    <circle cx="200" cy="360" r="74" fill="url(#sunDiscGrad)" stroke="#FFECA0" stroke-width="2.0" />
    <ellipse cx="178" cy="336" rx="38" ry="26" transform="rotate(-25 178 336)" fill="#FFFBE8" opacity="0.45" />
    <circle cx="168" cy="326" r="12" fill="#FFFFFF" opacity="0.80" />
  </g>

  <!-- Stars & Stardust around Sun -->
  <g id="sun-stars" fill="#FFE896" stroke="#FFFFFF" stroke-width="0.8">
    <path d="M 152 152 Q 152 165 139 165 Q 152 165 152 178 Q 152 165 165 165 Q 152 165 152 152 Z" />
    <path d="M 64 260 Q 64 270 54 270 Q 64 270 64 280 Q 64 270 74 270 Q 64 270 64 260 Z" />
    <path d="M 72 470 Q 72 480 62 480 Q 72 480 72 490 Q 72 480 82 480 Q 72 480 72 470 Z" />
    <path d="M 160 600 Q 160 612 148 612 Q 160 612 160 624 Q 160 612 172 612 Q 160 612 160 600 Z" />
    <circle cx="130" cy="205" r="2.8" />
    <circle cx="95" cy="340" r="2.5" />
    <circle cx="85" cy="420" r="2.2" />
    <circle cx="110" cy="530" r="2.8" />
    <circle cx="218" cy="620" r="2.5" />
    <circle cx="250" cy="570" r="3.0" />
  </g>

  <!-- 2. RIGHT SIDE: CRESCENT MOON & SERENE WOMAN'S PROFILE -->
  <!-- Top Finial -->
  <g id="top-finial">
    <path d="M 505 180 C 500 148 510 115 535 95 C 548 85 565 92 560 108 C 555 125 538 135 528 152 C 522 162 518 172 516 182 Z" fill="url(#silverScrollGrad)" stroke="#FFFFFF" stroke-width="1.0" />
    <path d="M 525 150 C 540 135 565 125 585 140 C 598 150 592 168 578 172 C 560 178 542 168 530 185 Z" fill="url(#goldReliefGrad)" stroke="#FFE896" stroke-width="1.0" />
    <circle cx="548" cy="98" r="5.5" fill="#FFEAA0" stroke="#8C5811" stroke-width="1.0" />
  </g>

  <!-- Bottom Finial -->
  <g id="bottom-finial">
    <path d="M 508 540 C 515 570 528 600 518 635 C 512 650 495 645 496 630 C 498 610 508 592 505 572 C 502 560 498 548 496 538 Z" fill="url(#silverScrollGrad)" stroke="#FFFFFF" stroke-width="1.0" />
    <path d="M 522 555 C 545 575 572 600 568 628 C 565 645 545 648 532 635 C 520 620 526 595 515 575 Z" fill="url(#goldReliefGrad)" stroke="#FFE896" stroke-width="1.0" />
    <path d="M 515 635 L 518 660 L 510 642 Z" fill="#E8B84B" />
  </g>

  <!-- Outer Golden Crescent Rim -->
  <path id="moon-outer-gold" d="
    M 512 182
    C 575 220 622 285 624 360
    C 625 435 578 505 514 542
    C 538 508 558 460 560 405
    C 564 300 535 235 512 182 Z"
    fill="url(#goldReliefGrad)" stroke="#FFEAA0" stroke-width="1.5" />

  <!-- Baroque Engravings on Outer Rim -->
  <path d="M 525 210 Q 565 250 580 300" stroke="#FFF5B8" stroke-width="2.4" fill="none" opacity="0.9" />
  <path d="M 545 225 Q 585 275 595 335" stroke="#7A4B0A" stroke-width="2.0" fill="none" opacity="0.8" />
  <path d="M 580 340 Q 602 380 592 430" stroke="#FFF5B8" stroke-width="2.4" fill="none" opacity="0.9" />
  <path d="M 565 435 Q 575 470 545 510" stroke="#7A4B0A" stroke-width="2.0" fill="none" opacity="0.8" />

  <!-- Inner Silver Crescent Body & Serene Woman Face Profile -->
  <path id="woman-face-and-crescent" d="
    M 512 182
    C 475 220 445 260 435 305
    C 430 320 422 334 416 345
    C 412 352 407 358 402 366
    C 398 372 396 376 400 378
    C 405 380 410 382 408 388
    C 404 394 402 398 406 402
    C 410 404 412 408 408 414
    C 404 420 406 426 412 430
    C 418 434 425 436 432 444
    C 445 460 465 485 490 515
    C 502 528 510 538 514 542
    C 550 495 560 430 558 375
    C 555 315 540 250 512 182 Z"
    fill="url(#silverFaceGrad)" stroke="#FFFFFF" stroke-width="1.5" />

  <!-- Face Details: Eyelashes, Eye, Nose, Lips, Cheek Scroll -->
  <g id="face-details">
    <path d="M 418 358 C 423 365 432 367 438 362" stroke="#1C222A" stroke-width="2.8" stroke-linecap="round" fill="none" />
    <path d="M 420 357 C 424 363 430 365 436 361" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" fill="none" />

    <!-- 5 curved dark eyelashes -->
    <path d="M 422 362 L 417 369" stroke="#151A20" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 426 365 L 423 373" stroke="#151A20" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 430 365 L 430 374" stroke="#151A20" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 434 364 L 436 372" stroke="#151A20" stroke-width="1.8" stroke-linecap="round" />

    <path d="M 414 345 C 422 342 432 344 440 350" stroke="#3A4450" stroke-width="2.4" stroke-linecap="round" fill="none" />
    <path d="M 406 380 C 410 379 414 382 413 386" stroke="#485360" stroke-width="1.6" stroke-linecap="round" fill="none" />
    <path d="M 402 402 C 406 401 412 402 416 405" stroke="#252D37" stroke-width="2.2" stroke-linecap="round" fill="none" />
    <path d="M 412 432 C 418 434 424 433 428 430" stroke="#5A6675" stroke-width="1.6" stroke-linecap="round" fill="none" />

    <!-- Temple & Cheek Gold Filigree -->
    <path d="M 438 335 C 445 328 456 332 454 342 C 452 350 442 352 444 360 C 446 368 456 370 458 378"
          stroke="#E8B84B" stroke-width="2.2" stroke-linecap="round" fill="none" />
    <circle cx="454" cy="342" r="2.8" fill="#FFECA0" />
    <circle cx="458" cy="378" r="2.5" fill="#FFECA0" />
  </g>

  <!-- 3. INNER HOLLOW: 3D SCULPTED SILVER HEART & GOLDEN FILIGREE -->
  <g id="heart-filigree" stroke="#E5B545" stroke-width="2.2" fill="none" stroke-linecap="round">
    <path d="M 525 330 C 510 305 528 275 550 288 C 565 296 558 318 545 325" />
    <path d="M 540 405 C 520 425 515 455 538 468 C 555 475 572 455 560 435 C 552 425 540 422 532 428" />
    <path d="M 495 365 C 485 375 492 392 505 388 C 515 385 522 372 516 360" />
    <circle cx="550" cy="288" r="3.0" fill="#FFECA0" stroke="#9E6814" stroke-width="1.0" />
    <circle cx="538" cy="468" r="3.0" fill="#FFECA0" stroke="#9E6814" stroke-width="1.0" />
  </g>

  <!-- 3D Puffed Sculpted Silver Heart -->
  <g id="silver-heart">
    <path d="
      M 545 408
      C 525 385 495 355 498 332
      C 500 315 515 305 530 312
      C 538 316 542 324 545 330
      C 548 324 552 316 560 312
      C 575 305 590 315 592 332
      C 595 355 565 385 545 408 Z"
      fill="url(#silverHeartGrad)" stroke="#FFFFFF" stroke-width="2.0" />

    <ellipse cx="524" cy="328" rx="14" ry="9" transform="rotate(-30 524 328)" fill="#FFFFFF" opacity="0.75" />
    <ellipse cx="568" cy="328" rx="10" ry="7" transform="rotate(25 568 328)" fill="#FFFFFF" opacity="0.55" />
    <path d="M 545 332 Q 545 370 545 406" stroke="#FFFFFF" stroke-width="1.4" fill="none" opacity="0.6" />
  </g>

  <!-- Stars inside hollow -->
  <g id="moon-stars">
    <g transform="translate(562, 275)" stroke="#FFE896" stroke-width="1.5" fill="#FFE896">
      <line x1="0" y1="-15" x2="0" y2="15" />
      <line x1="-15" y1="0" x2="15" y2="0" />
      <line x1="-11" y1="-11" x2="11" y2="11" />
      <line x1="11" y1="-11" x2="-11" y2="11" />
      <circle cx="0" cy="0" r="3.6" fill="#FFFFFF" stroke="#D4A02A" stroke-width="1.0" />
    </g>
    <circle cx="598" cy="308" r="6.0" fill="url(#sunDiscGrad)" stroke="#FFECA0" stroke-width="1.0" />
    <circle cx="608" cy="365" r="5.0" fill="url(#sunDiscGrad)" stroke="#FFECA0" stroke-width="1.0" />
    <path d="M 585 410 Q 585 420 575 420 Q 585 420 585 430 Q 585 420 595 420 Q 585 420 585 410 Z"
          fill="#FFE896" stroke="#FFFFFF" stroke-width="0.8" />
    <circle cx="520" cy="270" r="2.2" fill="#FFECA0" />
    <circle cx="578" cy="355" r="2.0" fill="#FFECA0" />
    <circle cx="568" cy="405" r="2.2" fill="#FFECA0" />
    <circle cx="552" cy="445" r="2.5" fill="#FFECA0" />
    <circle cx="510" cy="460" r="2.0" fill="#FFECA0" />
  </g>
</svg>`;

export const LOGO_DATA_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(LOGO_SVG_MARKUP)}`;
