// Format Vercel Serverless
export default async function handler(req, res) {
    // On n'autorise que le POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    const { menuData } = req.body;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = 'brahimamgar54';
    const GITHUB_REPO = 'smash-burger';
    const GITHUB_PATH = 'menu.json';

    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;

    try {
        // 1. Récupérer le SHA du fichier actuel
        const getRes = await fetch(apiUrl, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });

        let sha = null;
        if (getRes.status === 200) {
            const fileInfo = await getRes.json();
            sha = fileInfo.sha;
        }

        // 2. Préparer le contenu en Base64
        const content = Buffer.from(JSON.stringify(menuData, null, 2)).toString('base64');

        // 3. Envoyer la mise à jour à GitHub
        const putRes = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Mise à jour via Vercel Admin',
                content: content,
                sha: sha || undefined
            })
        });

        if (putRes.ok) {
            return res.status(200).json({ message: "OK" });
        } else {
            const errorData = await putRes.json();
            return res.status(putRes.status).json({ error: errorData.message });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
