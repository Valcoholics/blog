import { LogoProps } from './types';

const Logo = ({ alt, size }: LogoProps) => (
  <span
    role="img"
    aria-label={alt}
    style={{
      fontSize: size || 44,
      lineHeight: 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    ✴︎
  </span>
);

export default Logo;
