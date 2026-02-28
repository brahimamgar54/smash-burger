exports.handler = async (event) => {
  // 1. Vérification de la méthode
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: "Utilisez la methode POST" }) 
    };
  }

  try {
    // 2. Récupération des données
    const { menuData } = JSON.parse(event.body);
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = 'brahimamgar54';
    const GITHUB_REPO = 'smash-burger';
    const GITHUB_PATH = 'menu.json';

    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;

    // 3. Récupérer le SHA (pour savoir si on écrase ou on crée)
    const getRes = await fetch(apiUrl, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });

    let sha = null;
    if (getRes.status === 200) {
      const fileInfo = await getRes.json();
      sha = fileInfo.sha;
    }

    // 4. Encoder le contenu en Base64 (obligatoire pour GitHub)
    const content = Buffer.from(JSON.stringify(menuData, null, 2)).toString('base64');

    // 5. Envoi vers GitHub
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Mise a jour via interface admin',
        content: content,
        sha: sha || undefined 
      })
    });

    if (putRes.ok) {
      return { 
        statusCode: 200, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Sauvegarde reussie sur GitHub !" }) 
      };
    } else {
      const errorData = await putRes.json();
      return { 
        statusCode: putRes.status, 
        body: JSON.stringify({ error: errorData.message }) 
      };
    }

  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
