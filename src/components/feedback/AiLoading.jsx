import refreshIcon from '../../assets/icons/refresh.svg'
import Button from '../buttons/Button.jsx'
import ConfirmModal from '../dialogs/ConfirmModal.jsx'
import Spinner from './Spinner.jsx'
import styles from './AiLoading.module.css'

const MESSAGES = {
  // E-03 (0~8초)
  normal: {
    title: '1mm가 현재 에너지에 맞는\n가장 작은 행동을 고민하고 있어요...',
    description: '천천히 숨 한 번 쉬고 기다려 주세요',
  },
  // E-03a (8초 경과)
  slow: {
    title: '조금 더 걸리고 있어요.\n가장 작은 걸음을 신중하게 고르는 중이에요',
    description: '조금만 기다려 주세요. 입력하신 내용은 안전하게 남아 있어요',
  },
}

/**
 * AI 로딩 화면 (피그마 E-03 / E-03a) + 오류 모달 (E-04)
 * useAiRequest()의 결과를 ai로 넘겨서 씀:
 *   if (ai.state !== 'idle') return <AiLoading ai={ai} tags={...} />
 * - tags: 입력 요약 (목표, 에너지, 부담)
 * - 취소하고 돌아가기 / E-04 취소 → ai.cancel() (원래 화면, 입력 유지)
 * - E-04 다시 시도 → ai.retry()
 */
export default function AiLoading({ ai, tags }) {
  const message = ai.slow ? MESSAGES.slow : MESSAGES.normal

  return (
    <div className={styles.screen}>
      <div className={styles.center}>
        <Spinner />
        <div className={styles.text} role="status">
          <p className={styles.title}>{message.title}</p>
          <p className={styles.description}>{message.description}</p>
        </div>
        <ul className={styles.tags} aria-label="입력한 내용">
          {tags.map((tag) => (
            <li key={tag} className={styles.tag}>
              {tag}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.bottom}>
        <Button variant="text" className={styles.cancel} onClick={ai.cancel}>
          취소하고 돌아가기
        </Button>
      </div>

      <ConfirmModal
        open={ai.state === 'error'}
        icon={<img src={refreshIcon} alt="" />}
        title="앗, 행동을 가져오다 멈췄어요"
        description={'다시 시도할까요?\n입력하신 내용은 그대로 남아 있어요.'}
        secondaryLabel="취소"
        primaryLabel="다시 시도"
        onSecondary={ai.cancel}
        onPrimary={ai.retry}
        onDismiss={ai.cancel}
      />
    </div>
  )
}
