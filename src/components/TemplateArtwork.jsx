import React, { forwardRef, useId } from "react";

const accentShape = (style, accent, soft) => {
  switch (style) {
    case "sunny":
      return (
        <>
          <circle cx="303" cy="161" r="45" fill={soft} />
          <circle cx="303" cy="161" r="29" fill={accent} />
          <path d="M303 97v-15m0 158v-15m64-64h15m-158 0h15m109-45 11-11m-112 112 11-11m90 0 11 11m-112-112 11 11" stroke={accent} strokeWidth="3" strokeLinecap="round" />
          <path d="M256 226h95" stroke={accent} strokeWidth="2" opacity=".65" />
        </>
      );
    case "night":
      return (
        <>
          <path d="M304 100c-27 8-40 39-26 63 13 22 41 27 61 13-7 29-36 50-67 43-35-8-52-45-36-76 13-26 42-43 68-43Z" fill={soft} />
          <path d="m250 97 5 10 11 1-8 8 2 11-10-5-10 5 2-11-8-8 11-1 5-10Zm85 73 4 7 8 1-6 5 2 8-8-4-7 4 1-8-6-5 8-1 4-7Zm-137 31 3 7 8 1-6 5 1 8-6-4-7 4 2-8-6-5 8-1 3-7Z" fill={accent} />
        </>
      );
    case "wedding":
    case "garden":
    case "blue":
    case "terracotta":
      return (
        <>
          <path d="M45 235V180a155 155 0 0 1 310 0v55" fill="none" stroke={accent} strokeWidth="3" opacity=".72" />
          <path d="M67 235V184a133 133 0 0 1 266 0v51" fill="none" stroke={soft} strokeWidth="2" opacity=".78" />
          <circle cx="200" cy="102" r="5" fill={accent} />
          <path d="M74 218c12-12 19-24 20-39m232 39c-12-12-19-24-20-39" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" opacity=".72" />
        </>
      );
    case "birthday":
    case "party":
    case "pop":
      return (
        <>
          <path d="M59 88c0-23 19-42 42-42s42 19 42 42c0 29-28 54-42 62-14-8-42-33-42-62Zm199 8c0-19 15-34 34-34s34 15 34 34c0 24-22 44-34 51-12-7-34-27-34-51Z" fill={soft} opacity=".8" />
          <path d="M101 150v20m191-13v19" stroke={accent} strokeWidth="2" />
          <path d="m217 61 8 14 16 2-12 11 3 16-15-8-14 8 3-16-12-11 16-2 7-14Zm-93 201 6 11 13 2-10 9 2 13-11-6-12 6 2-13-9-9 13-2 6-11Zm155 34 5 10 11 1-8 8 2 11-10-5-10 5 2-11-8-8 11-1 5-10Z" fill={accent} />
        </>
      );
    case "coffee":
    case "menu":
      return (
        <>
          <circle cx="286" cy="184" r="79" fill={soft} opacity=".82" />
          <path d="M255 156h57v52c0 22-13 37-29 37s-28-15-28-37v-52Zm57 13h10c13 0 19 9 16 20-3 10-11 16-26 15m-65 74h101" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M266 143c-8-11 9-17 1-29m25 29c-8-11 9-17 1-29" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity=".72" />
        </>
      );
    case "studio":
      return (
        <>
          <path d="M265 123h72v70a36 36 0 0 1-72 0v-70Zm-20 108h112v11H245z" fill={soft} stroke={accent} strokeWidth="3" strokeLinejoin="round" />
          <path d="M279 123V98h44v25m-28-38c-10-13 11-20 2-34m24 34c-10-13 11-20 2-34" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
          <circle cx="246" cy="273" r="7" fill={accent} /><circle cx="287" cy="269" r="4" fill={accent} opacity=".6" /><circle cx="337" cy="271" r="9" fill={accent} opacity=".45" />
        </>
      );
    case "sound":
      return (
        <>
          <circle cx="302" cy="170" r="78" fill={soft} />
          <circle cx="302" cy="170" r="52" fill="none" stroke={accent} strokeWidth="3" opacity=".5" />
          <circle cx="302" cy="170" r="28" fill={accent} />
          <path d="m294 154 26 16-26 16v-32Zm-113-50h32m-47 25h46m-37 25h30" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case "festival":
    case "winter":
    case "spring":
      return (
        <>
          <path d="M60 89 339 85M78 105l-18-16m61 16-18-16m62 16-18-16m62 16-18-16m62 16-18-16m62 16-18-16" stroke={accent} strokeWidth="2" />
          <path d="M73 106c0 10 8 18 18 18s18-8 18-18m53 0c0 10 8 18 18 18s18-8 18-18m54 0c0 10 8 18 18 18s18-8 18-18" fill={soft} stroke={accent} strokeWidth="2" />
          <circle cx="88" cy="158" r="14" fill={accent} opacity=".8" />
          <circle cx="319" cy="204" r="10" fill={soft} />
          <path d="m313 201 6 6 6-6m-6-2v12" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case "home":
      return (
        <>
          <path d="m215 177 66-56 67 56v78h-133v-78Z" fill={soft} />
          <path d="m202 180 79-67 80 67m-128 75v-65h95v65m-60 0v-38h28v38" fill="none" stroke={accent} strokeWidth="4" strokeLinejoin="round" />
          <path d="M251 148h26" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case "social":
    case "reminder":
      return (
        <>
          <path d="M235 104c30-37 94-30 107 13 10 34-20 65-49 72-36 8-70-14-68-45 1-15 8-29 10-40Z" fill={soft} opacity=".92" />
          <path d="M222 116c19 3 35 20 39 42m25-56c-9 17-10 35-3 53m38-20c-12 6-21 17-25 31" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
          <circle cx="261" cy="217" r="7" fill={accent} />
          <circle cx="319" cy="239" r="11" fill={soft} />
        </>
      );
    case "market":
      return (
        <>
          <path d="M238 135h128l-13 33H251l-13-33Zm15 33h98v74h-98z" fill={soft} />
          <path d="m238 135-13 33h28l13-33m0 0-3 33h30v-33m0 0v33h30l-3-33m3 0 13 33h27l-13-33M270 202h30v40h-30z" fill="none" stroke={accent} strokeWidth="3" strokeLinejoin="round" />
          <path d="M322 191h17m-9-9 9 9-9 9" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case "sale":
      return (
        <>
          <circle cx="304" cy="165" r="70" fill={soft} />
          <circle cx="304" cy="165" r="53" fill="none" stroke={accent} strokeWidth="3" />
          <text x="304" y="158" textAnchor="middle" fill={accent} fontFamily="DM Sans, Arial, sans-serif" fontSize="17" fontWeight="700" letterSpacing="2">GOOD</text>
          <text x="304" y="180" textAnchor="middle" fill={accent} fontFamily="DM Sans, Arial, sans-serif" fontSize="17" fontWeight="700" letterSpacing="2">DEAL</text>
          <path d="M238 258h130" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity=".75" />
        </>
      );
    case "launch":
      return (
        <>
          <path d="m257 209 9-60 42-42 42 42 9 60-51-12-51 12Z" fill={soft} />
          <path d="m257 209 51-12 51 12-51 39-51-39Zm9-60 42 48 42-48m-42-42v90" fill="none" stroke={accent} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="308" cy="155" r="12" fill={accent} /><circle cx="308" cy="155" r="4" fill={soft} />
          <path d="m252 251-14 16m126-16 14 16" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        </>
      );
    default:
      return (
        <>
          <circle cx="302" cy="177" r="83" fill={soft} opacity=".8" />
          <path d="M255 135h94m-108 36h122m-112 36h103" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity=".68" />
          <circle cx="302" cy="177" r="21" fill={accent} />
          <path d="M80 304c30-15 54-15 83 0m-83 13c23-10 42-10 65 0" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity=".72" />
        </>
      );
  }
};

function wrapHeading(value = "") {
  const explicit = value.split("\n");
  if (explicit.length > 1) return explicit;
  const words = value.split(" ");
  const lines = [];
  let line = "";
  words.forEach((word) => {
    if ((line + " " + word).trim().length > 15 && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + " " + word).trim();
    }
  });
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function contrastingInk(hex, fallback, light) {
  const match = hex.match(/^#([0-9a-f]{6})$/i);
  if (!match) return fallback;
  const channels = match[1].match(/.{2}/g).map((part) => parseInt(part, 16) / 255);
  const luminance = channels
    .map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  return luminance < 0.34 ? light : fallback;
}

const TemplateArtwork = forwardRef(function TemplateArtwork({
  template,
  className = "",
  headline,
  subline,
  photo,
  background,
}, ref) {
  if (!template) return null;
  const [base, accent, defaultInk, paper] = template.palette;
  const lines = wrapHeading(headline ?? template.headline);
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const safeId = `${template.id}-${instanceId}`.replace(/[^a-zA-Z0-9_-]/g, "");
  const bg = background || base;
  const ink = bg.toLowerCase() === base.toLowerCase()
    ? defaultInk
    : contrastingInk(bg, defaultInk, paper);

  return (
    <svg
      ref={ref}
      className={`template-artwork ${className}`}
      viewBox="0 0 400 500"
      role="img"
      aria-label={`${template.name} ${template.category.toLowerCase()} design`}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`${safeId}-wash`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={paper} stopOpacity=".46" />
          <stop offset="100%" stopColor={accent} stopOpacity=".12" />
        </linearGradient>
        <pattern id={`${safeId}-grain`} width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="5" r="1" fill={ink} opacity=".07" />
          <circle cx="23" cy="17" r=".8" fill={ink} opacity=".055" />
          <circle cx="12" cy="29" r=".8" fill={ink} opacity=".045" />
        </pattern>
        <clipPath id={`${safeId}-photo-clip`}>
          <rect x="239" y="151" width="119" height="183" rx="59.5" />
        </clipPath>
      </defs>
      <rect width="400" height="500" fill={bg} />
      <rect width="400" height="500" fill={`url(#${safeId}-wash)`} />
      <rect width="400" height="500" fill={`url(#${safeId}-grain)`} />
      <path d="M0 384c85-34 162 17 240-3 56-15 103-44 160-23v142H0V384Z" fill={paper} opacity=".4" />
      {accentShape(template.style, accent, paper)}
      {photo && (
        <g clipPath={`url(#${safeId}-photo-clip)`}>
          <image href={photo} x="239" y="151" width="119" height="183" preserveAspectRatio="xMidYMid slice" />
          <rect x="239" y="151" width="119" height="183" fill={accent} opacity=".12" />
        </g>
      )}
      {photo && <rect x="239" y="151" width="119" height="183" rx="59.5" fill="none" stroke={paper} strokeWidth="5" />}
      <rect x="29" y="28" width="342" height="444" rx="3" fill="none" stroke={ink} strokeOpacity=".18" strokeWidth="1" />
      <text
        x="47"
        y="76"
        fill={accent}
        fontFamily="DM Sans, Arial, sans-serif"
        fontSize="12"
        fontWeight="700"
        letterSpacing="2.5"
      >
        {template.category.toUpperCase()}
      </text>
      <path d="M47 91h57" stroke={accent} strokeWidth="2" />
      <text
        x="47"
        y={lines.length === 1 ? 277 : lines.length === 2 ? 251 : 226}
        fill={ink}
        fontFamily="Playfair Display, Georgia, serif"
        fontSize={lines.length === 1 ? 42 : lines.length === 2 ? 35 : 31}
        fontWeight="600"
        letterSpacing="-1.2"
      >
        {lines.map((line, index) => (
          <tspan key={`${line}-${index}`} x="47" dy={index === 0 ? 0 : 43}>{line}</tspan>
        ))}
      </text>
      <text
        x="48"
        y={lines.length === 1 ? 310 : lines.length === 2 ? 336 : 366}
        fill={ink}
        fillOpacity=".76"
        fontFamily="DM Sans, Arial, sans-serif"
        fontSize="13"
      >
        {(subline ?? template.subline).slice(0, 39)}
      </text>
      <path d="M48 425h304" stroke={ink} strokeOpacity=".18" />
      <text
        x="48"
        y="449"
        fill={ink}
        fillOpacity=".64"
        fontFamily="DM Sans, Arial, sans-serif"
        fontSize="9"
        fontWeight="600"
        letterSpacing="1.8"
      >
        DZINEWALLAH · MADE BY YOU
      </text>
      <text x="352" y="449" textAnchor="end" fill={ink} fillOpacity=".48" fontFamily="DM Sans, Arial, sans-serif" fontSize="10">
        {template.id.slice(0, 2).toUpperCase()}
      </text>
    </svg>
  );
});

export default TemplateArtwork;
