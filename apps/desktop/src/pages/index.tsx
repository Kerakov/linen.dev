import { useEffect, useState } from 'react';
import { get } from '../utilities/http';
import styles from './index.module.scss';
import Logo from '../components/Logo/Linen';
import Button from '../components/Pages/Splash/Button';
import { FiRss } from 'react-icons/fi';

function App() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let mounted = true;
    get('/api/health')
      .then(async () => {
        if (mounted) {
          setActive(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setActive(false);
        }
      });
    const intervalId = setInterval(() => {
      get('/api/health')
        .then(async () => {
          if (mounted) {
            setActive(true);
          }
        })
        .catch(() => {
          if (mounted) {
            setActive(false);
          }
        });
    }, 5000);

    return () => {
      clearInterval(intervalId);
      mounted = false;
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.column}>
        <Logo />
        <header className={styles.header}>
          <h1>Streamline communication with your customers</h1>
          <p>
            It is easy to miss conversations in traditional chat apps. In Linen
            you can manage all of your conversations from multiple channels in a
            single Feed view. With open/close states you can view all the
            conversations that need your attention in a single page.
          </p>
        </header>

        <Button>Sign In</Button>
      </div>
      <div className={styles.column}>
        <FiRss className={styles.icon} />
      </div>
    </div>
  );
}

export default App;