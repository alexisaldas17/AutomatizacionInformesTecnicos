import styled from 'styled-components';

export const Container = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const PDFViewer = styled.div`
  width: 100%;
  max-width: 900px;
  height: 80vh;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
`;

export const ToastWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1300;
`;
