import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import style from './Scanner.module.css';

const Scanner = ({ onQRCodeRead, onClose }) => {
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);

    const scannerInstanceRef = useRef(null);
    const isComponentMounted = useRef(true);

    const qrcodeRegionId = 'reader';

    const success = (result) => {
        if (isComponentMounted.current) {
            const localScanner = scannerInstanceRef.current;
            if (localScanner) {
                localScanner.clear()
                    .then(() => {
                        scannerInstanceRef.current = null;
                        setScanResult(result);

                        if (onQRCodeRead) {
                            onQRCodeRead(result);
                        }
                    })
                    .catch(err => {
                        console.error("Erro ao limpar scanner:", err);
                        setScanResult(result);

                        if (onQRCodeRead) {
                            onQRCodeRead(result);
                        }
                    });
            } else {
                setScanResult(result);

                if (onQRCodeRead) {
                    onQRCodeRead(result);
                }
            }
        }
    };

    const handleScanAgain = () => {
        setScanResult(null);
        setError(null);
    };

    useEffect(() => {
        isComponentMounted.current = true;

        if (scanResult === null && !scannerInstanceRef.current) {

            if (!Html5QrcodeScanner) {
                setError("Biblioteca de scanner não foi carregada.");
                return;
            }

            const timer = setTimeout(() => {
                const element = document.getElementById(qrcodeRegionId);

                if (!element) {
                    console.error(`Elemento com id="${qrcodeRegionId}" não encontrado no DOM`);
                    return;
                }

                if (isComponentMounted.current && !scannerInstanceRef.current) {
                    const scanner = new Html5QrcodeScanner(qrcodeRegionId, {
                        qrbox: { width: 250, height: 250 },
                        fps: 10,
                        rememberLastUsedCamera: true,
                        aspectRatio: 1.0
                    });

                    scannerInstanceRef.current = scanner;
                    scanner.render(success);
                }
            }, 100);

            return () => {
                clearTimeout(timer);
            };
        }

        return () => {
            isComponentMounted.current = false;

            const localScanner = scannerInstanceRef.current;
            if (localScanner) {
                localScanner.clear()
                    .catch(err => {
                        console.error("Erro no cleanup:", err);
                    })
                    .finally(() => {
                        scannerInstanceRef.current = null;
                    });
            }
        };
    }, [scanResult]);

    return (
        <div className={style.appContainer}>
            <div className={style.scannerCard}>
                <h1 className={style.title}>
                    Scanner QR Code
                </h1>

                {scanResult ? (
                    <div className={style.resultContainer}>
                        <h2 className={style.resultTitle}>
                            Código Lido com Sucesso!
                        </h2>
                        <p className={style.resultText}>
                            {scanResult}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                onClick={handleScanAgain}
                                className={style.scanAgainButton}>
                                Escanear Novamente
                            </button>

                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className={style.closeButton}>
                                    Voltar
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <p className={style.instructionText}>
                            Aponte a câmera para o código QR
                        </p>
                        <div id={qrcodeRegionId}></div>

                        {error && (
                            <div className={style.errorBox}>
                                ❌ {error}
                            </div>
                        )}

                        {onClose && (
                            <button
                                onClick={onClose}
                                style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#757575',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}>
                                Voltar
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Scanner;