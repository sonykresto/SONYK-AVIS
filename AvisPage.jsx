import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const WEBHOOK_LECTURE = import.meta.env.VITE_WEBHOOK_LECTURE
const WEBHOOK_ECRITURE = import.meta.env.VITE_WEBHOOK_ECRITURE

export default function AvisPage() {
  const { slug } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [client, setClient] = useState(null) // { nom_restaurant, lien_google_review, actif }

  const [note, setNote] = useState(0)
  const [step, setStep] = useState('rating') // 'rating' | 'positive' | 'negative' | 'sent'
  const [commentaire, setCommentaire] = useState('')
  const [contact, setContact] = useState('')
  const [envoi, setEnvoi] = useState(false)

  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await fetch(`${WEBHOOK_LECTURE}?slug=${encodeURIComponent(slug)}`)
        if (!res.ok) throw new Error('not ok')
        const data = await res.json()
        if (!data || !data.nom_restaurant) throw new Error('empty')
        setClient(data)
      } catch (e) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchClient()
  }, [slug])

  function handleStar(val) {
    setNote(val)
    if (val >= 4) {
      setStep('positive')
      fetch(WEBHOOK_ECRITURE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, note: val, commentaire: '', contact: '' }),
      }).catch(() => {})
      setTimeout(() => {
        window.location.href = client.lien_google_review
      }, 900)
    } else {
      setStep('negative')
    }
  }

  async function handleSendPrivate() {
    setEnvoi(true)
    try {
      await fetch(WEBHOOK_ECRITURE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, note, commentaire, contact }),
      })
    } catch (e) {
      // silencieux pour le client, on affiche quand même le merci
    } finally {
      setStep('sent')
    }
  }

  if (loading) {
    return <div className="page-center">Chargement...</div>
  }

  if (error || !client || client.actif === false) {
    return (
      <div className="page-center">
        <p>Cette page n'est pas disponible pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <div className="mark">{client.nom_restaurant}</div>
        <h1>Comment était votre visite ?</h1>
        <p className="sub">Votre avis nous aide à faire mieux — ça prend 10 secondes.</p>

        {step === 'rating' && (
          <>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  className={`star-btn ${v <= note ? 'lit' : ''}`}
                  onClick={() => handleStar(v)}
                  aria-label={`${v} étoiles`}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="star-hint">Touchez une étoile</div>
          </>
        )}

        {step === 'positive' && (
          <div className="panel show">
            <h2>Merci beaucoup !</h2>
            <p>Redirection vers Google...</p>
          </div>
        )}

        {step === 'negative' && (
          <div className="panel show">
            <h2>Merci de nous le dire</h2>
            <p>On aimerait comprendre ce qui n'a pas été à la hauteur.</p>

            <label className="field-label">Qu'est-ce qu'on pourrait améliorer ?</label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Votre commentaire..."
            />

            <label className="field-label">
              Numéro ou courriel (facultatif, si vous voulez qu'on vous recontacte)
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />

            <button className="btn-primary" onClick={handleSendPrivate} disabled={envoi}>
              {envoi ? 'Envoi...' : 'Envoyer en privé'}
            </button>

            <div className="divider-word">— ou —</div>

            
              className="btn-google quiet"
              href={client.lien_google_review}
              target="_blank"
              rel="noopener noreferrer"
            >
              Partager aussi sur Google
            </a>
          </div>
        )}

        {step === 'sent' && (
          <div className="panel show">
            <p className="sent-msg">Merci, c'est transmis à l'équipe. 🙏</p>
          </div>
        )}
      </div>
    </div>
  )
}
