interface ButtonProps {
  label: string;
  onClick: (data?: any) => void;
}

function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}