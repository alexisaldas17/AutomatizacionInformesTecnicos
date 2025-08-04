import styled, { keyframes } from 'styled-components';

const blink = keyframes`
  0%, 100% { background-color: ${({ theme }) => theme.blinkStart}; }
  50% { background-color: ${({ theme }) => theme.blinkMid}; }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 2rem;
  font-family: 'Segoe UI', sans-serif;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  min-height: 100vh;
  width: 100vw;
  box-sizing: border-box;
`;

export const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
`;

export const Title = styled.h2`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  gap: 0.5rem;

  ${({ theme }) =>
    theme.mode === 'dark'
      ? `
    color: white;
    background: none;
    -webkit-background-clip: unset;
    -webkit-text-fill-color: unset;
  `
      : `
     background: linear-gradient(to right, #a2c1d8ff, #0e1136ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `}

  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
`;


export const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
`;

export const Input = styled.input`
  padding: 0.6rem 1rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  min-width: 220px;
  font-size: 1rem;
  background-color: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.textFilter};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const Button = styled.button`
  padding: 0.6rem 1.2rem;
  background-color: ${({ theme }) => theme.buttonPrimary};
  color: ${({ theme }) => theme.buttonText};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.buttonPrimaryHover};
  }

  &.secondary {
    background-color: ${({ theme }) => theme.buttonSecondary};

    &:hover {
      background-color: ${({ theme }) => theme.buttonSecondaryHover};
    }
  }

  &.danger {
    background-color: ${({ theme }) => theme.buttonDanger};

    &:hover {
      background-color: ${({ theme }) => theme.buttonDangerHover};
    }
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background-color: ${({ theme }) => theme.tableBackground};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
`;

export const Th = styled.th`
  background-color: ${({ theme }) => theme.tableHeader};
  padding: 1rem;
  border-bottom: 2px solid ${({ theme }) => theme.border};
  text-align: left;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

export const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};

  &:last-child {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
  }
`;

export const TableRow = styled.tr`
  transition: background-color 0.3s ease;

  &.resaltado {
    animation: ${blink} 0.6s ease-in-out 3;
    font-weight: bold;
  }

  &:hover {
    background-color: ${({ theme }) => theme.rowHover};
    cursor: pointer;
  }
`;

export const PaginationContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

export const PaginationButton = styled.button`
  padding: 8px 16px;
  background-color: ${({ disabled, theme }) =>
    disabled ? theme.disabled : theme.buttonPrimary};
  color: ${({ theme }) => theme.buttonText};
  border: none;
  border-radius: 4px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.3s;
`;

export const PageInfo = styled.span`
  font-size: 1rem;
  font-weight: bold;
`;

export const PageSizeSelector = styled.div`
  margin-bottom: 1rem;
  text-align: right;

  label {
    margin-right: 0.5rem;
    font-weight: bold;
  }

  select {
    padding: 6px 10px;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.border};
    font-size: 1rem;
    background-color: ${({ theme }) => theme.inputBackground};
    color: ${({ theme }) => theme.textFilter};
  }
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin: 0 5px;
  padding: 6px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.iconHover};
  }

  svg {
    color: ${({ theme }) => theme.iconColor};
  }
`;
