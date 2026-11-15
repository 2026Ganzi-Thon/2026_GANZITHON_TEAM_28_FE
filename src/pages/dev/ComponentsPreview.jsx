import { useState } from 'react'
import layersIcon from '../../assets/icons/layers.svg'
import logoutIcon from '../../assets/icons/logout.svg'
import moonIcon from '../../assets/icons/moon.svg'
import pencilLargeIcon from '../../assets/icons/pencil-large.svg'
import refreshIcon from '../../assets/icons/refresh.svg'
import trashIcon from '../../assets/icons/trash.svg'
import Button from '../../components/buttons/Button.jsx'
import SocialButton from '../../components/buttons/SocialButton.jsx'
import BottomSheet from '../../components/dialogs/BottomSheet.jsx'
import ConfirmModal from '../../components/dialogs/ConfirmModal.jsx'
import NotificationPermissionSheet from '../../components/dialogs/NotificationPermissionSheet.jsx'
import OfflineBanner from '../../components/feedback/OfflineBanner.jsx'
import Spinner from '../../components/feedback/Spinner.jsx'
import { useToast } from '../../components/feedback/ToastProvider.jsx'
import Checkbox from '../../components/inputs/Checkbox.jsx'
import Chip from '../../components/inputs/Chip.jsx'
import FormErrorMessage from '../../components/inputs/FormErrorMessage.jsx'
import RadioCard from '../../components/inputs/RadioCard.jsx'
import TextArea from '../../components/inputs/TextArea.jsx'
import TextField from '../../components/inputs/TextField.jsx'
import Toggle from '../../components/inputs/Toggle.jsx'
import HistoryItem from '../../components/lists/HistoryItem.jsx'
import TopBar from '../../components/navigation/TopBar.jsx'
import styles from './ComponentsPreview.module.css'

/**
 * 공통 컴포넌트 미리보기 (개발 모드에서만: /dev/components)
 * 강서현 화면에서 쓸 컴포넌트를 상태별로 모아 보여줌. 각 항목 아래 코드는 그대로 복사해서 쓰면 됨.
 * 배포 빌드에는 포함되지 않음 (main.jsx에서 import.meta.env.DEV일 때만 연결)
 */

// 확인 모달 예시 (피그마 Overlay/Modal 계열 — 모두 ConfirmModal 하나로 만듦)
const MODALS = {
  pause: {
    name: 'S-04b 쉬어가기 확인',
    icon: moonIcon,
    title: '정말 쉬어갈까요?',
    description: '지금까지의 기록은 안전하게 저장돼요.\n준비되면 언제든 이 걸음부터 이어갈 수 있어요.',
    secondaryLabel: '계속하기',
    primaryLabel: '쉬어가기',
  },
  aiError: {
    name: 'E-04 AI 오류',
    icon: refreshIcon,
    title: '앗, 행동을 가져오다 멈췄어요',
    description: '다시 시도할까요?\n입력하신 내용은 그대로 남아 있어요.',
    secondaryLabel: '취소',
    primaryLabel: '다시 시도',
  },
  deleteRecords: {
    name: 'D-01 기록 지우기 확인',
    icon: trashIcon,
    title: '모든 기록을 지울까요?',
    description: '지금까지 내디딘 걸음 기록이 모두 사라져요.\n지운 기록은 다시 되돌릴 수 없어요.',
    secondaryLabel: '지우기',
    secondaryTone: 'danger',
    primaryLabel: '그대로 둘게요',
  },
  unsaved: {
    name: 'D-02 저장 안 한 변경',
    icon: pencilLargeIcon,
    title: '바꾼 내용을 저장할까요?',
    description: '저장하지 않고 나가면\n방금 바꾼 닉네임이 반영되지 않아요.',
    secondaryLabel: '저장 안 함',
    primaryLabel: '저장하기',
  },
  logout: {
    name: 'D-04 로그아웃 확인',
    icon: logoutIcon,
    title: '로그아웃할까요?',
    description: '다시 로그인하면 지금까지의 기록을\n그대로 이어갈 수 있어요.',
    secondaryLabel: '취소',
    primaryLabel: '로그아웃',
  },
  goalLimit: {
    name: 'G-04 목표 3개 초과',
    icon: layersIcon,
    title: '지금은 목표가 3개예요',
    description: '새 목표를 시작하려면 하나를 마무리하거나\n잠시 내려놓아 주세요. 여러 개를 한 번에\n하지 않아도 정말 괜찮아요.',
    secondaryLabel: '닫기',
    primaryLabel: '목표 정리하기',
  },
}

export default function ComponentsPreview() {
  const showToast = useToast()
  const [chip, setChip] = useState('low')
  const [text, setText] = useState('')
  const [field, setField] = useState('하루')
  const [toggle, setToggle] = useState(true)
  const [agree, setAgree] = useState(false)
  const [endChoice, setEndChoice] = useState('completed')
  const [buttonLoading, setButtonLoading] = useState(false)
  const [modal, setModal] = useState(null)
  const [sheet, setSheet] = useState(null) // 'notification' | 'basic'

  const current = modal ? MODALS[modal] : null

  return (
    <div className={styles.page}>
      <TopBar title="공통 컴포넌트" onBack={() => history.back()} />
      <p className={styles.intro}>
        개발 모드에서만 보이는 화면이에요. 파일은 <code>src/components</code>에 있고, 각 파일 위쪽 주석에 사용법이 있어요.
      </p>

      <Section title="Button" path="buttons/Button.jsx" code={`<Button onClick={...}>해봤어요</Button>
<Button variant="secondary">더 작게</Button>
<Button variant="text">쉬어가기</Button>
<Button disabled>...</Button>   // aria-disabled, 탭 막힘
<Button loading={saving}>...</Button>   // 1초 지나면 스피너`}>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="text" className={styles.full}>
          Text
        </Button>
        <Button disabled>Disabled</Button>
        <Button
          loading={buttonLoading}
          onClick={() => {
            setButtonLoading(true)
            setTimeout(() => setButtonLoading(false), 2500)
          }}
        >
          누르면 2.5초 로딩 (1초 뒤 스피너)
        </Button>
      </Section>

      <Section title="SocialButton (S-00)" path="buttons/SocialButton.jsx" code={`<SocialButton provider="kakao" onClick={...} />   // 'kakao' | 'apple' | 'google'`}>
        <SocialButton provider="kakao" />
        <SocialButton provider="apple" />
        <SocialButton provider="google" />
      </Section>

      <Section title="Chip (단일 선택)" path="inputs/Chip.jsx" code={`<div role="radiogroup" aria-labelledby={질문제목id}>
  <Chip label="조금 남아 있음" selected={v === 'low'} onClick={() => setV('low')} />
</div>`}>
        <div className={styles.row} role="radiogroup" aria-label="에너지 예시">
          {[
            ['drained', '완전히 방전됨'],
            ['low', '조금 남아 있음'],
            ['normal', '보통이에요'],
          ].map(([value, label]) => (
            <Chip key={value} label={label} selected={chip === value} onClick={() => setChip(value)} />
          ))}
        </div>
      </Section>

      <Section title="TextArea · TextField · FormErrorMessage" path="inputs/" code={`<TextArea value={v} onChange={setV} maxChars={50} placeholder="..." error={hasError} />
<TextField value={v} onChange={setV} maxChars={10} placeholder="닉네임을 입력해 주세요" />
{hasError && <FormErrorMessage id={errId}>무엇을 하면 되는지 알려주는 문장</FormErrorMessage>}
// onChange는 문자열을 넘겨줌 · 글자 수는 앞뒤 공백 빼고, 이모지 1자`}>
        <TextArea value={text} onChange={setText} maxChars={50} placeholder="예) 방 청소하기, 과제 시작하기" />
        <TextField value={field} onChange={setField} maxChars={10} placeholder="닉네임을 입력해 주세요" aria-label="닉네임" />
        <TextField value="" onChange={() => {}} error placeholder="오류 상태" aria-label="오류 예시" />
        <FormErrorMessage>닉네임을 1~10자로 입력해 주세요</FormErrorMessage>
      </Section>

      <Section title="Toggle (S-09-1)" path="inputs/Toggle.jsx" code={`<Toggle checked={on} onChange={setOn} label="부드러운 리마인드" />   // role="switch"`}>
        <div className={styles.row}>
          <span id="preview-toggle-label">부드러운 리마인드</span>
          <Toggle checked={toggle} onChange={setToggle} labelledBy="preview-toggle-label" />
          <Toggle checked={false} onChange={() => {}} label="꺼진 예시" />
        </div>
      </Section>

      <Section title="Checkbox (S-01-1 · S-09-2)" path="inputs/Checkbox.jsx" code={`<Checkbox checked={agree} onChange={setAgree}>[필수] ... 동의</Checkbox>   // 행 전체가 눌림`}>
        <Checkbox checked={agree} onChange={setAgree}>
          [필수] AI 걸음 추천을 위한 입력 정보 처리 동의
        </Checkbox>
        <Checkbox checked onChange={() => {}}>
          체크된 예시
        </Checkbox>
      </Section>

      <Section title="RadioCard (S-07)" path="inputs/RadioCard.jsx" code={`<div role="radiogroup" aria-labelledby={질문제목id}>
  <RadioCard name="end" value="completed" checked={v === 'completed'} onChange={setV}
    title="끝까지 해냈어요" description="목표를 완료로 기록할게요" />
</div>`}>
        <div className={styles.column} role="radiogroup" aria-label="목표 종료 예시">
          <RadioCard
            name="preview-end"
            value="completed"
            checked={endChoice === 'completed'}
            onChange={setEndChoice}
            title="끝까지 해냈어요"
            description="목표를 완료로 기록할게요"
          />
          <RadioCard
            name="preview-end"
            value="released"
            checked={endChoice === 'released'}
            onChange={setEndChoice}
            title="여기서 그만둘래요"
            description="지금까지의 걸음은 기록에 남아요"
          />
        </div>
      </Section>

      <Section title="HistoryItem (S-06)" path="lists/HistoryItem.jsx" code={`<ul>
  <HistoryItem meta="방 청소하기 · 오후 3:12" action="..." status="해봤어요" />
  <HistoryItem ... last />   // 마지막은 세로선 숨김
</ul>`}>
        <ul className={styles.list}>
          <HistoryItem meta="방 청소하기 · 오후 3:12" action="책상 위에 있는 쓰레기 1개만 버리기" status="해봤어요" />
          <HistoryItem meta="전공 과제 시작하기 · 오후 1:40" action="노트북 열어두기만 하기" status="시도했어요" />
          <HistoryItem meta="산책하기 · 오전 10:05" action="현관까지 걸어가기" status="쉬어갔어요" last />
        </ul>
      </Section>

      <Section title="Toast" path="feedback/ToastProvider.jsx" code={`const showToast = useToast()
showToast({ type: 'success', title: '...', description: '...' })   // 2.5초
showToast({ type: 'simple', title: '...' })                        // 2초
showToast({ type: 'notice', title: '...' })                        // 3.5초 · 안내/실패
// 문구는 피그마 T-01 Toast Catalog`}>
        <Button
          variant="secondary"
          onClick={() =>
            showToast({ type: 'success', title: '작은 시작을 해낸 것을 축하해요!', description: '1mm 움직인 오늘의 나, 정말 멋져요' })
          }
        >
          Success
        </Button>
        <Button variant="secondary" onClick={() => showToast({ type: 'simple', title: '닉네임을 바꿨어요' })}>
          Simple
        </Button>
        <Button
          variant="secondary"
          onClick={() => showToast({ type: 'notice', title: '저장하지 못했어요. 잠시 후 다시 시도해 주세요' })}
        >
          Notice
        </Button>
      </Section>

      <Section title="확인 모달 (ConfirmModal)" path="dialogs/ConfirmModal.jsx" code={`<ConfirmModal open={open} icon={<img src={trashIcon} alt="" />}
  title="모든 기록을 지울까요?" description={'첫 줄\\n둘째 줄'}
  secondaryLabel="지우기" secondaryTone="danger" onSecondary={...}
  primaryLabel="그대로 둘게요" onPrimary={...}
  onDismiss={...} />   // 딤·Esc 동작은 모달마다 다름 (피그마 설명 참고)`}>
        {Object.entries(MODALS).map(([key, item]) => (
          <Button key={key} variant="secondary" onClick={() => setModal(key)}>
            {item.name}
          </Button>
        ))}
      </Section>

      <Section title="바텀시트" path="dialogs/" code={`<NotificationPermissionSheet open={open} onAllow={...} onLater={...} />   // D-03
<BottomSheet open={open} onClose={...} labelledBy={제목id}>...</BottomSheet>   // 직접 만들 때`}>
        <Button variant="secondary" onClick={() => setSheet('notification')}>
          D-03 알림 사전 안내 시트
        </Button>
        <Button variant="secondary" onClick={() => setSheet('basic')}>
          BottomSheet 기본 틀
        </Button>
      </Section>

      <Section title="그 밖의 피드백" path="feedback/" code={`<OfflineBanner />   // useOnlineStatus()가 false일 때 상단에
<Spinner />          // 48px 로딩
<StatusScreen loading /> · <StatusScreen title="..." actionLabel="홈으로 가기" onAction={...} />`}>
        <OfflineBanner />
        <div className={styles.row}>
          <Spinner />
        </div>
      </Section>

      <ConfirmModal
        open={Boolean(current)}
        icon={current && <img src={current.icon} alt="" />}
        title={current?.title}
        description={current?.description}
        secondaryLabel={current?.secondaryLabel}
        secondaryTone={current?.secondaryTone}
        primaryLabel={current?.primaryLabel}
        onSecondary={() => setModal(null)}
        onPrimary={() => setModal(null)}
        onDismiss={() => setModal(null)}
      />

      <NotificationPermissionSheet
        open={sheet === 'notification'}
        onAllow={() => setSheet(null)}
        onLater={() => setSheet(null)}
      />

      <BottomSheet open={sheet === 'basic'} onClose={() => setSheet(null)} labelledBy="preview-sheet-title">
        <h2 id="preview-sheet-title" className={styles.sheetTitle} tabIndex={-1}>
          BottomSheet 기본 틀
        </h2>
        <p className={styles.intro}>손잡이, 딤, Esc 닫기, 포커스 가두기가 들어 있어요. 안에 넣을 내용만 만들면 돼요.</p>
        <Button variant="text" className={styles.full} onClick={() => setSheet(null)}>
          닫기
        </Button>
      </BottomSheet>
    </div>
  )
}

function Section({ title, path, code, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <code className={styles.path}>{path}</code>
      </div>
      <div className={styles.demo}>{children}</div>
      <pre className={styles.code}>
        <code>{code}</code>
      </pre>
    </section>
  )
}
