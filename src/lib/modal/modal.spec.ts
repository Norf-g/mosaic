import { Component, DebugElement, ElementRef, EventEmitter, Input, NgModule } from '@angular/core';
import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { OverlayContainer } from '@ptsecurity/cdk/overlay';
import { McMeasureScrollbarService } from '@ptsecurity/mosaic/core';

import { CssUnitPipe } from './css-unit.pipe';
import { McModalControlService } from './modal-control.service';
import { McModalRef } from './modal-ref.class';
import { McModalModule } from './modal.module';
import { McModalService } from './modal.service';


// tslint:disable:no-magic-numbers
// tslint:disable:max-line-length
// tslint:disable:no-console
// tslint:disable:no-unnecessary-class
describe('McModal - css-unit.pipe', () => {
    let testElement: HTMLDivElement;
    let fixture: ComponentFixture<{}>;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                CssUnitPipe, TestCssUnitPipeComponent
            ]
        });

        TestBed.compileComponents();
    }));

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [  ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestCssUnitPipeComponent);
        testElement = fixture.debugElement.query(By.css('div')).nativeElement;
        fixture.detectChanges();
    });

    it('should "width" & "height" to be 100px', () => {
        // fixture.detectChanges();
        expect(testElement.style.width).toBe('100px');
        expect(testElement.style.height).toBe('100px');
    });

    it('should "top" to be 100pt', () => {
        // fixture.detectChanges();
        expect(testElement.style.top).toBe('100pt');
    });
});

describe('McModal', () => {
    let modalService: McModalService;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [ McModalModule ],
            providers   : [ McMeasureScrollbarService ],
            declarations: [
                ModalByServiceComponent
            ]
        });

        TestBed.compileComponents();
    }));

    beforeEach(inject([ McModalService, OverlayContainer ], (ms: McModalService, oc: OverlayContainer) => {
        modalService = ms;
        overlayContainer = oc;
        overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    describe('created by service', () => {
        let fixture: ComponentFixture<ModalByServiceComponent>;

        beforeEach(() => {
            fixture = TestBed.createComponent(ModalByServiceComponent);
        });

        // wait all openModals tobe closed to clean up the ModalManager as it is globally static
        afterEach(fakeAsync(() => {
            modalService.closeAll();
            fixture.detectChanges();
            tick(1000);
        }));

        it('should trigger both afterOpen/mcAfterOpen and have the correct openModals length', fakeAsync(() => {
            const spy = jasmine.createSpy('afterOpen spy');
            const mcAfterOpen = new EventEmitter<void>();
            const modalRef = modalService.create({ mcAfterOpen });

            modalRef.afterOpen.subscribe(spy);
            mcAfterOpen.subscribe(spy);

            fixture.detectChanges();
            expect(spy).not.toHaveBeenCalled();

            tick(600);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(modalService.openModals.indexOf(modalRef)).toBeGreaterThan(-1);
            expect(modalService.openModals.length).toBe(1);
        }));

        it('should modal not be registered twice', fakeAsync(() => {
            const modalRef = modalService.create();

            fixture.detectChanges();
            (modalService as any).modalControl.registerModal(modalRef);
            tick(600);
            expect(modalService.openModals.length).toBe(1);
        }));

        it('should trigger mcOnOk/mcOnCancel', () => {
            const spyOk = jasmine.createSpy('ok spy');
            const spyCancel = jasmine.createSpy('cancel spy');
            const modalRef: McModalRef = modalService.create({
                mcOnOk: spyOk,
                mcOnCancel: spyCancel
            });

            fixture.detectChanges();

            modalRef.triggerOk();
            expect(spyOk).toHaveBeenCalled();

            modalRef.triggerCancel();
            expect(spyCancel).toHaveBeenCalled();
        });
    });
});


// -------------------------------------------
// | Testing Components
// -------------------------------------------

@Component({
    template: `<div [style.width]="100 | toCssUnit" [style.height]="'100px' | toCssUnit" [style.top]="100 | toCssUnit:'pt'"></div>`
})
class TestCssUnitPipeComponent { }


@Component({
    selector: 'mc-modal-by-service',
    template: `
        <mc-modal [(mcVisible)]="nonServiceModalVisible"></mc-modal>
    `,
    // Testing for service with parent service
    providers: [ McModalControlService ]
})
export class ModalByServiceComponent {
    nonServiceModalVisible = false;

    constructor(modalControlService: McModalControlService) {}
}
