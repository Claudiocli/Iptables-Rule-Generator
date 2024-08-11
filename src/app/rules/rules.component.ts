import { Component, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent {

  public source_as_device = false;
  public destination_as_device = false;

  public chain_selected: string = "";
  public action_selected: string = "";
  public traffic_selected: string = "";
  public source_port_selected: number = 0;
  public destination_port_selected: number = 0;

  public source_address: string = "";
  public source_mask: string = "";
  public source_device: string = "";
  public destination_address: string = "";
  public destination_mask: string = "";
  public destination_device: string = "";

  public new_source: string = "";
  public new_source_port: number = 0;
  public new_destination: string = "";
  public new_destination_port: number = 0;
  public has_been_copied:boolean = false;

  public f_option = false;
  // x implies f
  public x_option = false;

  public isValid() {
    if (this.chain_selected == "")
      return false;
    if (this.action_selected == "")
      return false;
    return true;
  }

  public outputRule() {
    let output;
    if (this.chain_selected.includes('ROUTING')) {
      output = `iptables -t nat -A ${this.chain_selected} `;
    } else {
      output = `iptables -A ${this.chain_selected} `;
    }
    if (this.source_as_device && this.source_device != '') {
      output += `-i ${this.source_device}${this.source_port_selected == 0 || this.source_port_selected == null ? '' : ' --sport ' + this.source_port_selected} `;
    } else if (this.source_address != '') {
      output += `-s ${this.source_address}${this.source_mask == '' ? '' : '/' + this.source_mask}${this.source_port_selected == 0 || this.source_port_selected == null ? '' : ' --sport ' + this.source_port_selected} `;
    }
    if (this.traffic_selected !== '') {
      output += '-p '
    }
    output += `${this.traffic_selected} `;
    if (this.destination_as_device && this.destination_device != '') {
      output += `-o ${this.destination_device}${this.destination_port_selected == 0 || this.destination_port_selected == null ? '' : ' --dport ' + this.destination_port_selected} `;
    } else if (this.destination_address != '') {
      output += `-d ${this.destination_address}${this.destination_mask == '' ? '' : '/' + this.destination_mask}${this.destination_port_selected == 0 || this.destination_port_selected == null ? '' : ' --dport ' + this.destination_port_selected} `;
    }
    output += `-j ${this.action_selected}`;
    if (this.action_selected.includes('SNAT')) {
      output += ` --to-source ${this.new_source}${this.new_source_port == 0 || this.new_source_port == null ? '' : ':' + this.new_source_port}`;
    } else if (this.action_selected.includes('DNAT')) {
      output += ` --to-destination ${this.new_destination}${this.new_destination_port == 0 || this.new_destination_port == null ? '' : ':' + this.new_destination_port}`;
    }
    return output;
  }


  public isSNAT() {
    return this.action_selected.includes('SNAT');
  }

  public isDNAT() {
    return this.action_selected.includes('DNAT');
  }

  public x_implies_f() {
    if (!this.x_option)
      this.f_option = true;
  }

  public f_if_x() {
    if (!this.x_option) {
      this.f_option = true;
      return this.f_option;
    }
    this.f_option = !this.f_option;
    return this.f_option;
  }

  //if something changes in the form, reset the copy button



  public copyToClipboard() {
    const clip_text = this.f_option ? 'iptables -F; ' : '';
    clip_text += this.x_option ? 'iptables -X; ' : '';
    clip_text += this.outputRule();
    navigator.clipboard.writeText(clip_text).then(() => {
      this.has_been_copied = true;
      const clip_element = document.getElementById('clipboard-text');
      clip_element?.classList.add('vanishing');
      setTimeout(() => {
        clip_element?.classList.remove('vanishing');
      }, 6000);
    }).catch(err => {
      console.error('Failed to copy rule to clipboard: ', err);
    });
  }

}
