export async function GET() {
  try {
    // Import data dynamically
    const { characters, supportCards } = await import('@/lib/static-content');

    console.log(`Loading search data: ${characters.length} characters, ${supportCards.length} cards`);

    const searchData = {
      pages: [
        { name_en: "Characters", type: "page", url: "/characters/" },
        { name_en: "Support Cards", type: "page", url: "/cards/" },
        { name_en: "Tier List", type: "page", url: "/tier-list/" },
        { name_en: "Tools", type: "page", url: "/tools/" }
      ],
      tools: [
        { name_en: "Factor Calculator", type: "tool", url: "/tools/factor-calculator/" },
        { name_en: "Training Calculator", type: "tool", url: "/tools/training-calculator/" },
        { name_en: "Support Deck Builder", type: "tool", url: "/tools/support-deck/" },
        { name_en: "Training Goals", type: "tool", url: "/tools/training-goals/" },
        { name_en: "Skill Builder", type: "tool", url: "/tools/skill-builder/" }
      ],
      characters: characters?.map(c => ({
        id: c.id,
        name_en: c.name_en,
        name_ja: c.name_ja,
        type: 'character',
        rarity: c.rarity
      })) || [],
      cards: supportCards?.map(c => ({
        id: c.id,
        name_en: c.name_en,
        name_ja: c.name_ja,
        type: 'card',
        rarity: c.rarity,
        cardType: c.type
      })) || []
    };

    return new Response(JSON.stringify(searchData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error generating search data:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
