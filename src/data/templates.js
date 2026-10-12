const template = (id, category, name, headline, subline, palette, style) => ({
  id,
  category,
  name,
  headline,
  subline,
  palette,
  style,
});

export const templates = [
  template("birthday-bloom", "Birthday", "Birthday in Bloom", "MAKE A WISH", "A little more magic, a lot more you", ["#f7c6bc", "#aa4050", "#3d2932", "#fff5e8"], "birthday"),
  template("birthday-citrus", "Birthday", "A Sunny Birthday", "GOOD THINGS", "Another year around the sun", ["#f4d35e", "#ee6c4d", "#252b32", "#fff7da"], "sunny"),
  template("birthday-night", "Birthday", "Midnight Confetti", "IT'S YOUR DAY", "The celebration starts here", ["#27224c", "#f5b544", "#fff8ed", "#f46d82"], "night"),
  template("birthday-party", "Birthday", "Little Party", "LET'S CELEBRATE", "Cake, candles & your favorite people", ["#d8e7dc", "#ec7f63", "#23382e", "#fbf2df"], "party"),
  template("birthday-pop", "Birthday", "Birthday Pop", "BORN TO SHINE", "Big wishes for your big day", ["#e7c3f2", "#8755b3", "#322346", "#fff4b9"], "pop"),

  template("business-coffee", "Business", "Good Morning Coffee", "YOUR NEW\nDAILY RITUAL", "Small-batch coffee, made with care", ["#f4e4cd", "#a85332", "#3a2923", "#fff8ec"], "coffee"),
  template("business-market", "Business", "Weekend Market", "MADE TO BE\nDISCOVERED", "Find your next favorite, this Saturday", ["#f6ce77", "#327467", "#222e31", "#fff2d6"], "market"),
  template("business-studio", "Business", "Open Studio", "MADE BY HAND", "Objects for a slower, softer home", ["#e6d9cb", "#a4644e", "#382f2a", "#f9f4ec"], "studio"),
  template("business-sale", "Business", "The Good Edit", "A LITTLE\nON SALE", "The pieces you saved, for less", ["#d5e5de", "#cc5946", "#263c35", "#fcf1de"], "sale"),
  template("business-real-estate", "Business", "The Linden House", "ROOM TO\nFEEL AT HOME", "A place to put down roots", ["#d5e1d6", "#768c68", "#29372b", "#f6f0e3"], "home"),

  template("wedding-olive", "Wedding", "Olive & Ivory", "TOGETHER\nWITH THEIRS", "Please join us to celebrate", ["#e4e8d4", "#71805c", "#37402f", "#fbf7eb"], "wedding"),
  template("wedding-celeste", "Wedding", "A Day in Blue", "JUNE 14", "A celebration of love & all things beautiful", ["#dce7ed", "#718da0", "#283d4b", "#fffaf0"], "blue"),
  template("invite-dinner", "Wedding", "The Dinner Party", "AN EVENING\nTO REMEMBER", "Drinks, dinner, dancing — you are invited", ["#d7c1a8", "#8c493c", "#382a29", "#fbf0dc"], "dinner"),
  template("wedding-terracotta", "Wedding", "Desert Promise", "SAVE\nOUR DATE", "Maya & Arjun · November 08", ["#f0d3bc", "#ba6850", "#4b322b", "#fcf2e2"], "terracotta"),
  template("invite-garden", "Wedding", "Garden Notes", "A GARDEN\nGATHERING", "Join us beneath the old oak tree", ["#e0eadb", "#64806b", "#2f4938", "#fbf6e9"], "garden"),

  template("festival-lights", "Festival", "Festival of Light", "LET THE\nLIGHT IN", "Wishing you warmth, wonder & joy", ["#f5d16b", "#d86b43", "#553527", "#fff4cd"], "festival"),
  template("festival-holi", "Festival", "Color in the Air", "A DAY FULL\nOF COLOR", "Let every shade find a place", ["#f3c9dd", "#bb4d92", "#442643", "#fff5df"], "colors"),
  template("festival-harvest", "Festival", "Gather & Give Thanks", "A SEASON\nTO SHARE", "Good food, good people, good things", ["#e7cba0", "#9d633d", "#453528", "#f8f0df"], "harvest"),
  template("festival-winter", "Festival", "Winter Wishes", "WARM WISHES", "May your days be bright & cozy", ["#d9e8e6", "#4e8580", "#2d4443", "#f8f4e8"], "winter"),
  template("festival-spring", "Festival", "Hello, Spring", "GROW INTO\nTHE LIGHT", "A fresh beginning for everyone", ["#e5edbd", "#6f8a4b", "#394a30", "#fbf4dc"], "spring"),

  template("social-sunday", "Social Media", "Sunday Reset", "TAKE IT\nSLOW", "A quiet morning is a good place to start", ["#e9ded0", "#b77756", "#45342e", "#fbf5ea"], "social"),
  template("social-stretch", "Social Media", "A Gentle Reminder", "YOU CAN\nBEGIN AGAIN", "One small step is still a step", ["#dce7d3", "#70895f", "#344431", "#f8f4e7"], "reminder"),
  template("social-sound", "Social Media", "Sound Check", "MADE FOR\nTHE MOMENT", "New sounds for wherever you are", ["#ddd2fb", "#7755bc", "#31274c", "#f9f5ff"], "sound"),
  template("social-menu", "Social Media", "The Daily Menu", "A GOOD DAY\nSTARTS HERE", "Fresh plates, local favorites, all day", ["#f3dec0", "#c05e3d", "#49332a", "#fff5e4"], "menu"),
  template("social-launch", "Social Media", "A Fresh Chapter", "SOMETHING\nGOOD IS HERE", "Meet your new favorite, starting today", ["#e7d1c1", "#9e624d", "#48342f", "#fbf3e7"], "launch"),
];

export const categories = ["All", "Birthday", "Business", "Wedding", "Festival", "Social Media"];
