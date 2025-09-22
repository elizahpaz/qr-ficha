import styles from './SubmitButton.module.css';

const SubmitButton = ({ text, ...rest }) => {
  return (
    <button className={styles.btn} {...rest}> {text} </button>
  )
}

export default SubmitButton;