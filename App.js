import React, { useState } from 'react';
import { Button, StyleSheet } from 'react-native';
import { sha256 } from 'js-sha256';
import * as ed from '@noble/ed25519';
import { Buffer } from 'buffer';

import { ThemedText } from './components/ThemedText';
import { ThemedView } from './components/ThemedView';
import { ThemedTextInput } from './components/ThemedInputText';

function App() {
    const [message, setMessage] = useState('');
    const [hash, setHash] = useState('');
    const [signature, setSignature] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [verifyMessage, setVerifyMessage] = useState('');
    const [verifySignature, setVerifySignature] = useState('');
    const [verifyPublicKey, setVerifyPublicKey] = useState('');
    const [verifyResult, setVerifyResult] = useState(null);

    const privateKey = ed.utils.randomPrivateKey();

    const handleSign = async () => {
        const msgHash = sha256(message);
        const msgBytes = new TextEncoder().encode(message);

        const sig = await ed.signAsync(msgBytes, privateKey);
        const pub = await ed.getPublicKeyAsync(privateKey);

        setHash(msgHash);
        setSignature(Buffer.from(sig).toString('base64'));
        setPublicKey(Buffer.from(pub).toString('base64'));
    };

    const handleVerify = async () => {
        const pubKeyBytes = Buffer.from(verifyPublicKey, 'base64');
        const sigBytes = Buffer.from(verifySignature, 'base64');
        const msgBytes = new TextEncoder().encode(verifyMessage);
        try {
            const valid = await ed.verifyAsync(sigBytes, msgBytes, pubKeyBytes);
            setVerifyResult(valid);
        } catch (e) {
            console.error('handleVerify', e);
            setVerifyResult(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="defaultSemiBold" style={styles.title}>Sign & Verify (Ed25519)</ThemedText>
            <ThemedTextInput
                style={styles.input}
                placeholder="Enter message to sign"
                value={message}
                onChangeText={setMessage}
                multiline
            />
            <Button title="Hash + Sign" onPress={handleSign} />
            {hash !== '' && (
                <ThemedView style={styles.outputBox}>
                    <ThemedText>SHA-256 Hash: {hash}</ThemedText>
                    <ThemedText>Signature (base64): {signature}</ThemedText>
                    <ThemedText>Public Key (base64): {publicKey}</ThemedText>
                </ThemedView>
            )}

            <ThemedText type="defaultSemiBold" style={styles.subtitle}>Verify</ThemedText>
            <ThemedTextInput
                style={styles.input}
                placeholder="Message to verify"
                value={verifyMessage}
                onChangeText={setVerifyMessage}
                multiline
            />
            <ThemedTextInput
                style={styles.input}
                placeholder="Signature (base64)"
                value={verifySignature}
                onChangeText={setVerifySignature}
            />
            <ThemedTextInput
                style={styles.input}
                placeholder="Public Key (base64)"
                value={verifyPublicKey}
                onChangeText={setVerifyPublicKey}
            />
            <Button title="Verify" onPress={handleVerify} />
            {verifyResult !== null && (
                <ThemedText style={{ color: verifyResult ? 'green' : 'red' }}>
                    {verifyResult ? 'Valid ✅' : 'Invalid ❌'}
                </ThemedText>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 24, marginBottom: 20 },
    subtitle: { fontSize: 20, marginTop: 30 },
    input: {
        borderWidth: 1,
        padding: 10,
        marginVertical: 10,
        borderRadius: 6,
        minHeight: 60,
    },
    outputBox: { marginTop: 20 },
});


export default App;
