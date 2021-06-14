import { Arg, Substitute, SubstituteOf } from '@fluffy-spoon/substitute';

import { ApiService } from '../../../src/abstractions/api.service';
import { CryptoService } from '../../../src/abstractions/crypto.service';
import { FileUploadService } from '../../../src/abstractions/fileUpload.service';
import { I18nService } from '../../../src/abstractions/i18n.service';
import { SearchService } from '../../../src/abstractions/search.service';
import { SettingsService } from '../../../src/abstractions/settings.service';
import { StorageService } from '../../../src/abstractions/storage.service';
import { UserService } from '../../../src/abstractions/user.service';
import { Utils } from '../../../src/misc/utils';
import { Cipher } from '../../../src/models/domain/cipher';
import { EncArrayBuffer } from '../../../src/models/domain/encArrayBuffer';
import { EncString } from '../../../src/models/domain/encString';
import { SymmetricCryptoKey } from '../../../src/models/domain/symmetricCryptoKey';

import { CipherService } from '../../../src/services/cipher.service';

const ENCRYPTED_TEXT = 'This data has been encrypted';
const ENCRYPTED_BYTES = new EncArrayBuffer(Utils.fromUtf8ToArray(ENCRYPTED_TEXT).buffer);

describe('Cipher Service', () => {
    let cryptoService: SubstituteOf<CryptoService>;
    let userService: SubstituteOf<UserService>;
    let settingsService: SubstituteOf<SettingsService>;
    let apiService: SubstituteOf<ApiService>;
    let fileUploadService: SubstituteOf<FileUploadService>;
    let storageService: SubstituteOf<StorageService>;
    let i18nService: SubstituteOf<I18nService>;
    let searchService: SubstituteOf<SearchService>;

    let cipherService: CipherService;

    beforeEach(() => {
        cryptoService = Substitute.for<CryptoService>();
        userService = Substitute.for<UserService>();
        settingsService = Substitute.for<SettingsService>();
        apiService = Substitute.for<ApiService>();
        fileUploadService = Substitute.for<FileUploadService>();
        storageService = Substitute.for<StorageService>();
        i18nService = Substitute.for<I18nService>();
        searchService = Substitute.for<SearchService>();

        cryptoService.encryptToBytes(Arg.any(), Arg.any()).resolves(ENCRYPTED_BYTES);
        cryptoService.encrypt(Arg.any(), Arg.any()).resolves(new EncString(ENCRYPTED_TEXT));

        cipherService = new CipherService(cryptoService, userService, settingsService, apiService, fileUploadService,
            storageService, i18nService, () => searchService);
    });

    it('attachments upload encrypted file contents', async () => {
        const key = new SymmetricCryptoKey(new Uint8Array(32).buffer);
        const fileName = 'filename';
        const fileData = new Uint8Array(10).buffer;
        cryptoService.getOrgKey(Arg.any()).resolves(new SymmetricCryptoKey(new Uint8Array(32).buffer));

        await cipherService.saveAttachmentRawWithServer(new Cipher(), fileName, fileData);

        fileUploadService.received(1).uploadCipherAttachment(Arg.any(), Arg.any(), fileName, ENCRYPTED_BYTES);
    });
});
